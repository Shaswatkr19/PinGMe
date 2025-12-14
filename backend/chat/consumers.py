from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
import json

from .models import Thread, Message
from .serializers import MessageSerializer

User = get_user_model()


class EchoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(json.dumps({"msg": "Connected to PingMe Echo Server"}))

    async def receive(self, text_data):
        await self.send(json.dumps({"echo": text_data}))


class ChatConsumer(AsyncWebsocketConsumer):

    # =============================
    # CONNECT
    # =============================
    async def connect(self):
        self.user = self.scope.get("user")

        # 🔐 Auth check
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.thread_id = self.scope["url_route"]["kwargs"]["thread_id"]

        # 🔐 Thread membership check
        allowed = await self.is_user_in_thread(self.user.id, self.thread_id)
        if not allowed:
            await self.close()
            return

        self.room_group_name = f"chat_{self.thread_id}"

        # Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Mark user online
        await self.mark_messages_delivered(self.user.id, self.thread_id)


        await self.set_user_online(self.user.id)

        await self.accept()

        # 🔥 BROADCAST ONLINE STATUS
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence_event",
                "user_id": self.user.id,
                "is_online": True,
            }
        )

        await self.send(json.dumps({
            "type": "system",
            "msg": f"Connected to chat room {self.thread_id}"
        }))

    # =============================
    # DISCONNECT
    # =============================
    async def disconnect(self, close_code):
    # Agar user authenticated hai tabhi offline mark karo
        if getattr(self, "user", None) and self.user.is_authenticated:
            await self.set_user_offline(self.user.id)

        # 🔥 ONLINE → OFFLINE broadcast (safe)
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "presence_event",
                    "user_id": self.user.id,
                    "is_online": False,
                }
            )

    # 🔐 Group se safely remove karo
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    # =============================
    # RECEIVE
    # =============================
    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")

        # -----------------------------
        # TYPING INDICATOR
        # -----------------------------
        if event_type == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_event",
                    "user_id": self.user.id,
                    "is_typing": data.get("is_typing", False),
                }
            )
            return

        if event_type == "media":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": data
                }
            )
            return
            
        # -----------------------------
        # NORMAL MESSAGE
        # -----------------------------
        message_text = data.get("message", "").strip()
        if not message_text:
            return

        saved_message = await self.save_message(
            sender_id=self.user.id,
            thread_id=self.thread_id,
            text=message_text
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message
            }
        )

    # =============================
    # SEND MESSAGE TO CLIENT
    # =============================
    async def chat_message(self, event):
        message = event["message"]

    # ✅ Mark delivered
        await self.mark_delivered(
            message_id=message["id"],
            user_id=self.user.id
        )

        await self.send(json.dumps({
            "type": "message",
            **message
        }))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "delivery_event",
                "message_id": message["id"],
                "user_id": self.user.id,
            }
        )

    # =============================
    # SEND TYPING EVENT
    # =============================
    async def typing_event(self, event):
        # Sender ko wapas typing event mat bhejo
        if event["user_id"] == self.user.id:
            return

        await self.send(json.dumps({
            "type": "typing",
            "user_id": event["user_id"],
            "is_typing": event["is_typing"]
        }))

    # SEND ONLINE / OFFLINE EVENT
    async def presence_event(self, event):
    # apne aap ko wapas mat bhejo
        if event["user_id"] == self.user.id:
            return

        await self.send(json.dumps({
            "type": "presence",
            "user_id": event["user_id"],
            "is_online": event["is_online"]
        }))    

    async def delivery_event(self, event):
        await self.send(json.dumps({
            "type": "delivered",
            "message_id": event["message_id"],
            "user_id": event["user_id"],
        }))

    # =============================
    # DB: SAVE MESSAGE
    # =============================
    @database_sync_to_async
    def save_message(self, sender_id, thread_id, text):
        sender = User.objects.get(id=sender_id)
        thread = Thread.objects.get(id=thread_id)

        msg = Message.objects.create(
            sender=sender,
            thread=thread,
            text=text
        )

        return MessageSerializer(msg).data

    # =============================
    # SECURITY: THREAD CHECK
    # =============================
    @database_sync_to_async
    def is_user_in_thread(self, user_id, thread_id):
        return Thread.objects.filter(
            id=thread_id,
            members__id=user_id
        ).exists()

    # =============================
    # ONLINE / OFFLINE HELPERS
    # =============================
    @database_sync_to_async
    def set_user_online(self, user_id):
        User.objects.filter(id=user_id).update(
            is_online=True,
            last_seen=timezone.now()
        )
        cache.set(f"user_online_{user_id}", True)

    @database_sync_to_async
    def set_user_offline(self, user_id):
        User.objects.filter(id=user_id).update(
            is_online=False,
            last_seen=timezone.now()
        )
        cache.delete(f"user_online_{user_id}")

    @database_sync_to_async
    def mark_messages_delivered(self, user_id, thread_id):
        user = User.objects.get(id=user_id)
        thread = Thread.objects.get(id=thread_id)

        messages = Message.objects.filter(
            thread=thread
        ).exclude(
            sender=user
        ).exclude(
            delivered_to=user
        )

        for msg in messages:
            msg.delivered_to.add(user)
        
