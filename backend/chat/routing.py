from django.urls import re_path
from .consumers import ChatConsumer, CallConsumer

websocket_urlpatterns = [
    # 💬 Chat
    re_path(r"ws/chat/(?P<thread_id>\d+)/$", ChatConsumer.as_asgi()),

    # 📞 Call (VERY IMPORTANT)
    re_path(r"ws/call/(?P<thread_id>\d+)/$", CallConsumer.as_asgi()),
]