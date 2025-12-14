from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer
from users.models import User


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


# -----------------------------
# Send message in a thread
# -----------------------------
class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        thread_id = self.kwargs.get("thread_id")

        thread = Thread.objects.filter(
            id=thread_id,
            members=self.request.user
        ).first()

        if not thread:
            raise PermissionDenied("You are not allowed in this thread")

        message = serializer.save(
            sender=self.request.user,
            thread=thread
        )

        # sender ne khud ka message read kiya hua hota hai
        message.read_by.add(self.request.user)