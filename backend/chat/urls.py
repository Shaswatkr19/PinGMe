from django.urls import path
from .views import (
    ThreadListView, CreateThreadView,
    MessageListView, SendMessageView
)

urlpatterns = [
    path("", ThreadListView.as_view()),
    path("create/", CreateThreadView.as_view()),
    path("<int:thread_id>/messages/", MessageListView.as_view()),
    path("<int:thread_id>/send/", SendMessageView.as_view()),
]