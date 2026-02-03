import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer, AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone

from .models import Thread, Message
from .serializers import MessageSerializer

User = get_user_model()


# =====================================================
# 📞 CALL CONSUMER (WebRTC Signaling)
# =====================================================
class CallConsumer(AsyncJsonWebsocketConsumer):

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

        self.room_group_name = f"call_{self.thread_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        print(f"📞 Call WS connected | user={self.user.id} | thread={self.thread_id}")

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        print(f"📴 Call WS disconnected | user={getattr(self.user,'id',None)}")

    # -------------------------------------------------
    # RECEIVE SIGNAL FROM CLIENT
    # -------------------------------------------------
    async def receive_json(self, content):
        """
        content example:
        {
          type: "call:initiate" | "call:accept" | "call:reject"
                | "offer" | "answer" | "ice"
          data: {...}
        }
        """

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "signal_event",     # MUST MATCH METHOD NAME
                "payload": content,
                "sender_id": self.user.id,  # VERY IMPORTANT
            }
        )

    # -------------------------------------------------
    # SEND SIGNAL TO OTHER USERS
    # -------------------------------------------------
    async def signal_event(self, event):
        # ❌ sender ko khud ka signal mat bhejo
        if event["sender_id"] == self.user.id:
            return

        await self.send_json(event["payload"])

    # -------------------------------------------------
    # HELPERS
    # -------------------------------------------------
    @database_sync_to_async
    def is_user_in_thread(self, user_id, thread_id):
        return Thread.objects.filter(
            id=thread_id,
            members__id=user_id
        ).exists()


# =====================================================
# 💬 CHAT CONSUMER (Messages + Typing + Presence)
# =====================================================
class ChatConsumer(AsyncWebsocketConsumer):

    # =============================
    # CONNECT
    # =============================
    async def connect(self):
        self.user = self.scope.get("user")

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.thread_id = self.scope["url_route"]["kwargs"]["thread_id"]

        allowed = await self.is_user_in_thread(self.user.id, self.thread_id)
        if not allowed:
            await self.close()
            return

        self.room_group_name = f"chat_{self.thread_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.mark_messages_delivered(self.user.id, self.thread_id)
        await self.set_user_online(self.user.id)

        await self.accept()

        # 🔥 ONLINE broadcast
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence_event",
                "user_id": self.user.id,
                "is_online": True,
            }
        )

    # =============================
    # DISCONNECT
    # =============================
    async def disconnect(self, close_code):
        if self.user and self.user.is_authenticated:
            await self.set_user_offline(self.user.id)

        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "presence_event",
                    "user_id": self.user.id,
                    "is_online": False,
                }
            )

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

        if data.get('type') == 'theme_change':
            await self.channel_layer.group_send(
                self.thread_group_name,
                {
                    'type': 'theme_update',
                    'theme': data.get('theme')
                }
            )

        # Typing
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

        # Media placeholder
        if event_type == "media":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": data
                }
            )
            return

        # Normal text message
        text = data.get("message", "").strip()
        if not text:
            return

        saved_message = await self.save_message(
            sender_id=self.user.id,
            thread_id=self.thread_id,
            text=text
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message
            }
        )

    # =============================
    # SEND MESSAGE
    # =============================
    async def chat_message(self, event):
        message = event["message"]

        await self.mark_delivered(
            message_id=message["id"],
            user_id=self.user.id
        )

        await self.send(json.dumps({
            "type": "message",
            **message
        }))

    # =============================
    # TYPING
    # =============================
    async def typing_event(self, event):
        if event["user_id"] == self.user.id:
            return

        await self.send(json.dumps({
            "type": "typing",
            "user_id": event["user_id"],
            "is_typing": event["is_typing"]
        }))

    # =============================
    # PRESENCE
    # =============================
    async def presence_event(self, event):
        if event["user_id"] == self.user.id:
            return

        try:
            await self.send(json.dumps({
                "type": "presence",
                "user_id": event["user_id"],
                "is_online": event["is_online"],
            }))
        except:
            pass  # socket already closed

    async def theme_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'theme_change',
            'theme': event['theme']
        }))

    async def reaction(self, event):
        """Handle reaction broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'message_id': event['message_id'],
            'emoji': event['emoji'],
            'user_id': event['user_id']
        }))        

    # =============================
    # DB HELPERS
    # =============================
    @database_sync_to_async
    def save_message(self, sender_id, thread_id, text):
        sender = User.objects.get(id=sender_id)
        thread = Thread.objects.get(id=thread_id)
        msg = Message.objects.create(sender=sender, thread=thread, text=text)
        return MessageSerializer(msg).data

    @database_sync_to_async
    def is_user_in_thread(self, user_id, thread_id):
        return Thread.objects.filter(
            id=thread_id,
            members__id=user_id
        ).exists()

    # @database_sync_to_async
    # def set_user_online(self, user_id):
    #     User.objects.filter(id=user_id).update(
    #         is_online=True,
    #         last_seen=timezone.now()
    #     )
    #     cache.set(f"user_online_{user_id}", True)

    # @database_sync_to_async
    # def set_user_offline(self, user_id):
    #     User.objects.filter(id=user_id).update(
    #         is_online=False,
    #         last_seen=timezone.now()
    #     )
    #     cache.delete(f"user_online_{user_id}")

    @database_sync_to_async
    def mark_messages_delivered(self, user_id, thread_id):
        user = User.objects.get(id=user_id)
        thread = Thread.objects.get(id=thread_id)

        messages = Message.objects.filter(
            thread=thread
        ).exclude(sender=user).exclude(delivered_to=user)

        for msg in messages:
            msg.delivered_to.add(user)

    @database_sync_to_async
    def mark_delivered(self, message_id, user_id):
        try:
            msg = Message.objects.get(id=message_id)
            user = User.objects.get(id=user_id)
            msg.delivered_to.add(user)
        except Message.DoesNotExist:
            pass


    @database_sync_to_async
    def set_user_online(self, user_id):
        key = f"user_connections_{user_id}"
        count = cache.get(key, 0) + 1

        cache.set(key, count, timeout=600)
        cache.set(f"user_online_{user_id}", True, timeout=600)

        User.objects.filter(id=user_id).update(
            is_online=True,
            last_seen=timezone.now()
        )    

    @database_sync_to_async
    def set_user_offline(self, user_id):
        key = f"user_connections_{user_id}"
        count = cache.get(key, 0) - 1

        if count <= 0:
            # 🔥 REAL OFFLINE
            cache.delete(key)
            cache.delete(f"user_online_{user_id}")

            User.objects.filter(id=user_id).update(
                is_online=False,
                last_seen=timezone.now()
            )
        else:
            # still has other tabs/devices
            cache.set(key, count, timeout=600)    