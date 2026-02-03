from django.urls import path
from .views import (
    ThreadListView, CreateThreadView,
    MessageListView, SendMessageView,
    MediaMessageUploadView,
    DeleteMessageView, SetThreadThemeView,
    MarkThreadReadView, react_to_message
)

urlpatterns = [
    path("", ThreadListView.as_view()),
    path("create/", CreateThreadView.as_view()),
    path("<int:thread_id>/messages/", MessageListView.as_view()),
    path("<int:thread_id>/send/", SendMessageView.as_view()),
    path("threads/<int:thread_id>/media/", MediaMessageUploadView.as_view(), name="media-message-upload"),
    path("message/<int:message_id>/", DeleteMessageView.as_view()),
    path("threads/<int:thread_id>/theme/", SetThreadThemeView.as_view()),
    path("chat/thread/<int:thread_id>/read/", MarkThreadReadView.as_view()),
    path('message/<int:message_id>/react/', react_to_message, name='react_to_message'),

]