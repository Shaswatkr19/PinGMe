from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Q
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer

class ThreadListView(generics.ListAPIView):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(members=self.request.user)


class CreateThreadView(generics.CreateAPIView):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        other_username = request.data.get("username")

        if not other_username:
            return Response({"error": "Username is required"}, status=400)

        from users.models import User
        try:
            other_user = User.objects.get(username=other_username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Fetch or create thread for both users
        thread = Thread.objects.filter(
            members=request.user
        ).filter(
            members=other_user
        ).first()

        if not thread:
            thread = Thread.objects.create()
            thread.members.add(request.user, other_user)

        return Response(ThreadSerializer(thread).data, status=201)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        thread_id = self.kwargs['thread_id']
        return Message.objects.filter(thread_id=thread_id)


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        thread_id = self.kwargs['thread_id']
        serializer.save(sender=self.request.user, thread_id=thread_id)