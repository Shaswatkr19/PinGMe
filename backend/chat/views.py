from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer
from users.models import User
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes


class MarkThreadReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        thread = get_object_or_404(Thread, id=thread_id)

        if request.user not in thread.members.all():
            return Response({"error": "Access denied"}, status=403)

        Message.objects.filter(
            thread=thread
        ).exclude(
            sender=request.user
        ).exclude(
            read_by=request.user
        ).update()

        return Response({"success": True})
        
@api_view(['POST'])
def react_to_message(request, message_id):
    """Add or remove reaction to a message"""
    try:
        message = Message.objects.get(id=message_id)
        emoji = request.data.get('emoji')
        
        # Check if user is part of the thread
        if request.user not in message.thread.members.all():
            return Response(
                {"error": "You don't have access to this message"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Toggle reaction
        if emoji is None:
            # Remove reaction
            message.reaction = None
        else:
            # Add/update reaction
            message.reaction = emoji
        
        message.save()
        
        # Broadcast to WebSocket
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{message.thread.id}",
            {
                "type": "reaction",
                "message_id": message.id,
                "emoji": emoji,
                "user_id": request.user.id
            }
        )
        
        return Response({"success": True, "emoji": emoji})
        
    except Message.DoesNotExist:
        return Response(
            {"error": "Message not found"},
            status=status.HTTP_404_NOT_FOUND
        )

class SetThreadThemeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id):
        try:
            thread = Thread.objects.get(id=thread_id, members=request.user)
        except Thread.DoesNotExist:
            return Response({"error": "Thread not found"}, status=404)

        thread.chat_theme = request.data.get("chat_theme")
        thread.save()

        return Response({
            "success": True,
            "chat_theme": thread.chat_theme
        })

class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        try:
            msg = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=404)

        # 🔐 only sender can delete
        if msg.sender != request.user:
            return Response({"error": "Not allowed"}, status=403)

        msg.delete()
        return Response({"success": True}, status=204)
# -----------------------------
# List all threads of logged-in user
# -----------------------------
class ThreadListView(generics.ListAPIView):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(members=self.request.user)

    def get_serializer_context(self):
        return {"request": self.request}


# -----------------------------
# Create or fetch 1-to-1 thread
# -----------------------------
class CreateThreadView(generics.CreateAPIView):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        other_username = request.data.get("username")

        if not other_username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            other_user = User.objects.get(username=other_username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if other_user == request.user:
            return Response(
                {"error": "You cannot chat with yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            other_user in request.user.blocked_users.all()
            or request.user in other_user.blocked_users.all()
        ):
            return Response({"error": "User blocked"}, status=403)
        
        # Check if user follows the other user
        if other_user not in request.user.following.all():
            return Response(
                {"error": "You must follow this user to start a chat"},
                status=status.HTTP_403_FORBIDDEN
            )

        thread = Thread.objects.filter(
            members=request.user
        ).filter(
            members=other_user
        ).distinct().first()

        if not thread:
            thread = Thread.objects.create()
            thread.members.add(request.user, other_user)

        return Response(
            ThreadSerializer(thread, context={"request": request}).data,
            status=status.HTTP_201_CREATED
        )


# -----------------------------
# List messages of a thread
# -----------------------------
class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs.get("thread_id")
        user = self.request.user

        # Security check: user must be thread member
        thread = Thread.objects.filter(
            id=thread_id,
            members=user
        ).first()

        if not thread:
            return Message.objects.none()

        messages = Message.objects.filter(
            thread=thread
        ).exclude(
            deleted_by=user
        ).order_by("created_at")

        # 🔥 MARK AS READ (PER USER)
        unread_messages = messages.exclude(
            sender=user
        ).exclude(
            read_by=user
        )

        for msg in unread_messages:
            msg.read_by.add(user)

        return messages
    
    def get_serializer_context(self):
        return {"request": self.request}


# -----------------------------
# Send message in a thread
# -----------------------------
class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        thread_id = self.kwargs.get("thread_id")
        user = self.request.user

        thread = Thread.objects.filter(
            id=thread_id,
            members=self.request.user
        ).first()

        if not thread:
            raise PermissionDenied("You are not allowed in this thread")

        other_user = thread.members.exclude(id=user.id).first()

        if other_user:
            if (
                other_user in user.blocked_users.all()
                or user in other_user.blocked_users.all()
            ):
                raise PermissionDenied("User blocked")   

        message = serializer.save(
            sender=self.request.user,
            thread=thread
        )

        # sender ne khud ka message read kiya hua hota hai
        message.read_by.add(self.request.user)
        
        # Broadcast via WebSocket
        channel_layer = get_channel_layer()
        message_serializer = MessageSerializer(message, context={"request": self.request})
        async_to_sync(channel_layer.group_send)(
            f"chat_{thread.id}",
            {
                "type": "chat_message",
                "message": message_serializer.data
            }
        )


class MediaMessageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, thread_id):
        user = request.user
        file = request.FILES.get("file")
        text = request.data.get("text", "")

        # 1️⃣ FILE REQUIRED
        if not file:
            return Response(
                {"error": "File is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2️⃣ FILE SIZE VALIDATION (10 MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        if file.size > MAX_FILE_SIZE:
            return Response(
                {"error": "File too large (max 10MB)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3️⃣ FILE TYPE VALIDATION
        ALLOWED_TYPES = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "application/pdf",
            "audio/webm",
            "audio/ogg",
            "audio/mpeg",  # mp3
            "audio/mp4",   # m4a
            "audio/wav",
        ]

        if file.content_type not in ALLOWED_TYPES:
            return Response(
                {"error": f"Unsupported file type: {file.content_type}"},  # 🔥 Better error
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4️⃣ THREAD CHECK
        thread = Thread.objects.filter(
            id=thread_id,
            members=user
        ).first()

        if not thread:
            raise PermissionDenied("You are not allowed in this thread")

        # 5️⃣ CREATE MESSAGE
        message = Message.objects.create(
            thread=thread,
            sender=user,
            text=text,
            attachment=file
        )

        serializer = MessageSerializer(
            message,
            context={"request": request}
        )
        
        # Mark as read by sender
        message.read_by.add(user)

        # 6️⃣ WEBSOCKET BROADCAST
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{thread.id}",
            {
                "type": "chat_message",
                "message": serializer.data
            }
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

# class MarkThreadReadView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, thread_id):
#         thread = get_object_or_404(Thread, id=thread_id)

#         unread_messages = Message.objects.filter(
#             thread=thread
#         ).exclude(
#             read_by=request.user
#         ).exclude(
#             sender=request.user
#         )

#         for msg in unread_messages:
#             msg.read_by.add(request.user)

#         return Response({"success": True})        