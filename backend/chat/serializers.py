from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Thread, Message

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'text', 'attachment', 'created_at', 'is_read']
        read_only_fields = ['sender', 'created_at']


class ThreadSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ['id', 'name', 'members', 'created_at', 'last_message']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None