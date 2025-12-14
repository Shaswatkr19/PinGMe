from django.urls import path
from .views import (
    ThreadListView, CreateThreadView,
    MessageListView, SendMessageView,
    MediaMessageUploadView
)

urlpatterns = [
    path("", ThreadListView.as_view()),
    path("create/", CreateThreadView.as_view()),
    path("<int:thread_id>/messages/", MessageListView.as_view()),
    path("<int:thread_id>/send/", SendMessageView.as_view()),
    path("threads/<int:thread_id>/media/", MediaMessageUploadView.as_view(), name="media-message-upload"),
]