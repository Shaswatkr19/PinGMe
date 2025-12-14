from rest_framework import serializers
from .models import User
from django.core.cache import cache
from django.utils import timezone

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()
    last_seen_display = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "avatar", "bio", "is_online", "last_seen", "last_seen_display"]


    def get_is_online(self, obj):
        return bool(cache.get(f"user_online_{obj.id}"))
    

    def get_last_seen_display(self, obj):
        # 🟢 User is online
        if obj.is_online:
            return "Online"

        if not obj.last_seen:
            return "Offline"

        now = timezone.now()
        diff = now - obj.last_seen

        seconds = diff.total_seconds()

        if seconds < 60:
            return "Last seen just now"
        elif seconds < 3600:
            minutes = int(seconds // 60)
            return f"Last seen {minutes} min ago"
        elif seconds < 86400:
            hours = int(seconds // 3600)
            return f"Last seen {hours} hour ago"
        else:
            days = int(seconds // 86400)
            return f"Last seen {days} day ago"    


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "bio", "avatar"]
        extra_kwargs = {
            "username": {"required": False},
            "bio": {"required": False},
            "avatar": {"required": False}, 
        }


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "avatar", "bio"]        