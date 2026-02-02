from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token):
    try:
        validated = JWTAuthentication().get_validated_token(token)
        return JWTAuthentication().get_user(validated)
    except Exception:
        return AnonymousUser()

class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)

        token = params.get("token")

        if token:
            scope["user"] = await get_user(token[0])
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)