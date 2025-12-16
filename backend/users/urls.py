from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LoginView, MeView,
    UpdateProfileView, FollowUserView, UnfollowUserView, UserSearchView, MyProfileView, UserOnlineStatusView
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
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("online-status/<int:user_id>/", UserOnlineStatusView.as_view()),
]