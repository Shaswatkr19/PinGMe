from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LoginView, MeView,
    UpdateProfileView, FollowUserView, UnfollowUserView, UserSearchView, MyProfileView, UserOnlineStatusView,
    UsernameAvailabilityView, PasswordResetRequestView, PasswordResetConfirmView,
    UnblockUserView, FollowersListView, FollowingListView, BlockedUsersListView
)

urlpatterns = [
    # JWT Token endpoints (USE THESE)
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Your custom views
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),  # Keep for later if needed
    path("me/", MeView.as_view()),
    path("update/", UpdateProfileView.as_view()),
    path("follow/<str:username>/", FollowUserView.as_view()),
    path("unfollow/<str:username>/", UnfollowUserView.as_view()),
    path("search/", UserSearchView.as_view(), name="user-search"),
    path("online-status/<int:user_id>/", UserOnlineStatusView.as_view()),
    
    # New endpoints
    path("check-username/", UsernameAvailabilityView.as_view()),
    path("password-reset/request/", PasswordResetRequestView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view()),
    
    # Settings endpoints
    path("me/followers/", FollowersListView.as_view()),
    path("me/following/", FollowingListView.as_view()),
    path("me/blocked/", BlockedUsersListView.as_view()),
    path("unblock/<str:username>/", UnblockUserView.as_view()),
]