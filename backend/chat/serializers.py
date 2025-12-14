from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Thread, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    delivered_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()


    class Meta:
        model = Message
        fields = [
            'id',
            'thread',
            'sender',
            'text',
            'attachment',
            'created_at',
            "delivered_count",
            "read_count",
            
        ]
        read_only_fields = ['sender', 'created_at']

    def get_delivered_count(self, obj):
        return obj.delivered_to.count()

    def get_read_count(self, obj):
        return obj.read_by.count()    


class ThreadSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id',
            'name',
            'members',
            'created_at',
            'last_message',
            'unread_count',
        ]

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        """
        Count messages not read by current user
        """
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return 0

        user = request.user
        return obj.messages.exclude(read_by=user).count()