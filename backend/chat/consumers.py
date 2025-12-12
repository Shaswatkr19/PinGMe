from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
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

    async def connect(self):
        self.thread_id = self.scope["url_route"]["kwargs"]["thread_id"]
        self.room_group_name = f"chat_{self.thread_id}"

        # Add client to room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.send(json.dumps({
            "msg": f"Connected to chat room {self.thread_id}"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receive WebSocket message → authenticate → save to DB → broadcast
        """
        data = json.loads(text_data)
        message_text = data.get("message", "")

        # -------------------------
        # AUTH CHECK (IMPORTANT)
        # -------------------------
        user = self.scope.get("user")

        if not user or getattr(user, "is_authenticated", False) is False:
            await self.send(json.dumps({"error": "Unauthenticated"}))
            return

        # -------------------------
        # SAVE MESSAGE IN DATABASE
        # -------------------------
        saved_message = await self.save_message(
            sender_id=user.id,
            thread_id=self.thread_id,
            text=message_text
        )

        # -------------------------
        # BROADCAST TO ALL MEMBERS
        # -------------------------
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message
            }
        )

    async def chat_message(self, event):
        """
        Send message to WebSocket
        """
        await self.send(json.dumps(event["message"]))

    # ====================================
    # DB helper (runs inside thread pool)
    # ====================================
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