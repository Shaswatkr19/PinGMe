from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from .models import User
from django.core.cache import cache
from django.db.models import Q
from .serializers import RegisterSerializer, UserSerializer, UpdateProfileSerializer, PublicUserSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    user = get_object_or_404(User, username=username)

    request.user.blocked_users.remove(user)
    request.user.following.add(user)

    return Response({
        "success": True,
        "is_following": True,
        "is_blocked": False
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unfollow_user(request, username):
    user = get_object_or_404(User, username=username)

    request.user.following.remove(user)

    return Response({
        "success": True,
        "is_following": False,
        "is_blocked": False
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_user(request, username):
    user = get_object_or_404(User, username=username)

    request.user.following.remove(user)
    request.user.blocked_users.add(user)

    return Response({
        "success": True,
        "is_following": False,
        "is_blocked": True
    }) 

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unblock_user(request, username):
    user = get_object_or_404(User, username=username)

    request.user.blocked_users.remove(user)

    return Response({
        "success": True,
        "is_following": False,
        "is_blocked": False
    })       

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    serializer_class = RegisterSerializer  # reuse username/password validation

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.filter(username=username).first()
        if user is None or not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
            }
        })


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def get_serializer_context(self):
        return {"request": self.request}


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Support file uploads

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Refresh user from database to get updated avatar URL
            request.user.refresh_from_db()
            
            # Return updated user data with full avatar URL
            user_serializer = UserSerializer(request.user, context={"request": request})
            return Response(user_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        request.user.following.add(target)
        return Response({"message": f"You are now following {username}"})


class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        request.user.following.remove(target)
        return Response({"message": f"You unfollowed {username}"})


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")

        return User.objects.filter(
            Q(username__icontains=query)
        ).exclude(id=self.request.user.id)
    
    def get_serializer_context(self):
        return {"request": self.request}


class UsernameAvailabilityView(APIView):
    """Check if username is available (real-time)"""
    permission_classes = []  # Public endpoint

    def get(self, request):
        username = request.query_params.get("username", "").strip()
        
        if not username:
            return Response({
                "available": False,
                "message": "Username is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Case-insensitive check
        exists = User.objects.filter(username__iexact=username).exists()
        
        return Response({
            "available": not exists,
            "message": "Available" if not exists else "Not available"
        })


class PasswordResetRequestView(APIView):
    """Request password reset via email"""
    permission_classes = []  # Public endpoint

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate Gmail
        if not email.endswith('@gmail.com'):
            return Response(
                {"error": "Only Gmail addresses are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists for security
            return Response({
                "message": "If the email exists, a password reset link has been sent."
            })
        
        # Generate token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"{settings.FRONTEND_URL or 'http://localhost:5173'}/password-reset/confirm?token={token}&uid={uid}"
        
        # Send email
        try:
            send_mail(
                subject="Password Reset Request - PingMe",
                message=f"Click the link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"error": "Failed to send email. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "message": "If the email exists, a password reset link has been sent."
        })


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""
    permission_classes = []  # Public endpoint

    def post(self, request):
        token = request.data.get("token")
        uid = request.data.get("uid")
        new_password = request.data.get("new_password")
        
        if not all([token, uid, new_password]):
            return Response(
                {"error": "Token, UID, and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired reset token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reset password
        user.set_password(new_password)
        user.save()
        
        return Response({
            "message": "Password has been reset successfully"
        })


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserOnlineStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        is_online = cache.get(f"user_online_{user.id}", False)

        return Response({
            "user_id": user.id,
            "username": user.username,
            "is_online": bool(is_online)
        })        

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username, *args, **kwargs):  # 👈 THIS LINE FIXES IT
        try:
            user_to_block = User.objects.get(username=username)

            if user_to_block.id == request.user.id:
                return Response(
                    {"error": "You cannot block yourself"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if request.user.blocked_users.filter(id=user_to_block.id).exists():
                return Response(
                    {"error": "User already blocked"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            request.user.blocked_users.add(user_to_block)

            if request.user.following.filter(id=user_to_block.id).exists():
                request.user.following.remove(user_to_block)

            return Response({"success": True}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username, *args, **kwargs):
        try:
            user_to_unblock = User.objects.get(username=username)

            if not request.user.blocked_users.filter(id=user_to_unblock.id).exists():
                return Response(
                    {"error": "User is not blocked"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            request.user.blocked_users.remove(user_to_unblock)
            return Response({"success": True}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class FollowersListView(generics.ListAPIView):
    """Get list of current user's followers"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.followers.all()
    
    def get_serializer_context(self):
        return {"request": self.request}


class FollowingListView(generics.ListAPIView):
    """Get list of users current user is following"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.following.all()
    
    def get_serializer_context(self):
        return {"request": self.request}


class BlockedUsersListView(generics.ListAPIView):
    """Get list of users current user has blocked"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.blocked_users.all()
    
    def get_serializer_context(self):
        return {"request": self.request}        