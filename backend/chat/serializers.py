from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.cache import cache
from users.serializers import UserSerializer
from .models import Thread, Message
import mimetypes

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    """Full user profile with all details"""
    avatar_url = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    bio = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "avatar_url",
            "bio",
            "is_online",
            "is_following",
            "is_blocked",
            "followers_count",
            "following_count",
        ]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_is_online(self, obj):
        return bool(cache.get(f"user_online_{obj.id}"))

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False

    def get_is_blocked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # User ne mujhe block kiya hai?
            return obj.blocked_users.filter(id=request.user.id).exists()
        return False

    def get_followers_count(self, obj):
        if hasattr(obj, 'followers'):
            return obj.followers.count()
        return 0

    def get_following_count(self, obj):
        if hasattr(obj, 'following'):
            return obj.following.count()
        return 0


class ThreadUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "avatar_url",
            "is_online",
            "is_following",
            "is_blocked",
        ]

    def get_is_online(self, obj):
        return bool(cache.get(f"user_online_{obj.id}"))

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False

    def get_is_blocked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user.blocked_users.filter(id=obj.id).exists()
        return False

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender = ThreadUserSerializer(read_only=True)
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
            "reaction"
            
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
        if not obj.attachment:
            return None

        mime_type, _ = mimetypes.guess_type(obj.attachment.name)
        return mime_type
    
    def to_representation(self, instance):
        """Override to include full attachment URL"""
        data = super().to_representation(instance)
        if instance.attachment:
            request = self.context.get("request")
            if request:
                data['attachment'] = request.build_absolute_uri(instance.attachment.url)
            else:
                data['attachment'] = instance.attachment.url
        return data

class ThreadSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id',
            'name',
            'members',
            'created_at',
            'last_message',
            'unread_count',
            'chat_theme',
            'is_blocked',
        ]

    def get_members(self, obj):
        return ThreadUserSerializer(
            obj.members.all(),
            many=True,
            context=self.context   # 🔥 THIS IS THE KEY
        ).data

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(
                msg,
                context=self.context   # 🔥 VERY IMPORTANT
            ).data
        return None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.exclude(
            read_by=user
        ).exclude(
            sender=user
        ).count()

    def get_is_blocked(self, obj):
        request = self.context.get("request")
        if not request:
            return False

        me = request.user

        # 1:1 chat → other user
        other = obj.members.exclude(id=me.id).first()
        if not other:
            return False

        return me.blocked_users.filter(id=other.id).exists()    