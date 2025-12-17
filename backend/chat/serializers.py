from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Thread, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    delivered_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()
    delivery_status = serializers.SerializerMethodField()  

    # 🆕 MEDIA METADATA
    is_media = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()

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
            "is_media",
            "file_name",
            "file_size",
            "file_type",
            "delivery_status",
            
        ]
        read_only_fields = ['sender', 'created_at', 'thread']

    def get_delivered_count(self, obj):
        return obj.delivered_to.count()

    def get_read_count(self, obj):
        return obj.read_by.count()    

    def get_delivery_status(self, obj):
        """
        Sender POV:
        sent → delivered → read
        """
        request = self.context.get("request")
        if not request:
            return "sent"

        user = request.user

        # only sender cares about status
        if obj.sender != user:
            return None

        if obj.read_by.exists():
            return "read"

        if obj.delivered_to.exists():
            return "delivered"

        return "sent"

    # -------- MEDIA HELPERS --------
    def get_is_media(self, obj):
        return bool(obj.attachment)

    def get_file_name(self, obj):
        if obj.attachment:
            return obj.attachment.name.split("/")[-1]
        return None

    def get_file_size(self, obj):
        if obj.attachment:
            return obj.attachment.size
        return None

    def get_file_type(self, obj):
        if obj.attachment:
            return obj.attachment.file.content_type
        return None

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