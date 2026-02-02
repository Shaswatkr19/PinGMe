from rest_framework import serializers
from .models import User
from django.core.cache import cache
from django.utils import timezone

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ["id", "email", "username", "password"]

    def validate_email(self, value):
        """Validate that email is a Gmail address"""
        email_lower = value.lower().strip()
        if not email_lower.endswith('@gmail.com'):
            raise serializers.ValidationError("Only Gmail addresses are allowed")

        if User.objects.filter(email__iexact=email_lower).exists():
            raise serializers.ValidationError("This Gmail is already registered")
    
        return email_lower

    def validate_username(self, value):
        """Validate username uniqueness (case-insensitive)"""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username is not available")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"]
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()
    last_seen_display = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "avatar", "avatar_url", "bio", "is_online", "last_seen", "last_seen_display", 
                 "followers_count", "following_count", "is_following", "is_blocked",]

    def get_is_online(self, obj):
        return bool(cache.get(f"user_online_{obj.id}"))
    
    def get_followers_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_is_following(self, obj):
        """Check if current user follows this user"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj in request.user.following.all()
        return False
    
    def get_avatar_url(self, obj):
        """Return full URL for avatar"""
        if obj.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def get_is_blocked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj in request.user.blocked_users.all()
        return False    

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
            "username": {"required": False, "read_only": True},  # Username cannot be changed
            "bio": {"required": False, "allow_blank": True},
            "avatar": {"required": False}, 
        }
    
    def validate_bio(self, value):
        """Validate bio length"""
        if value and len(value) > 150:
            raise serializers.ValidationError("Bio must be 150 characters or less")
        return value


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "avatar", "bio"]        