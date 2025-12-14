from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    UpdateProfileView, FollowUserView, UnfollowUserView, UserSearchView, MyProfileView, UserOnlineStatusView
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("me/", MeView.as_view()),
    path("update/", UpdateProfileView.as_view()),
    path("follow/<str:username>/", FollowUserView.as_view()),
    path("unfollow/<str:username>/", UnfollowUserView.as_view()),
    path("search/", UserSearchView.as_view(), name="user-search"),
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("online-status/<int:user_id>/", UserOnlineStatusView.as_view()),
]
