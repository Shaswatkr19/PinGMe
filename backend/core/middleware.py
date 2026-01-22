from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # ✅ VERY IMPORTANT
        scope["user"] = AnonymousUser()

        token = None

        # ------------------------------------
        # 1️⃣ Token from Authorization header
        # ------------------------------------
        headers = dict(scope.get("headers", []))
        if b"authorization" in headers:
            try:
                auth = headers[b"authorization"].decode()
                if auth.startswith("Bearer "):
                    token = auth.split(" ")[1]
            except:
                pass

        # ------------------------------------
        # 2️⃣ Token from query string (?token=)
        # ------------------------------------
        if not token:
            query = parse_qs(scope.get("query_string", b"").decode())
            token = query.get("token", [None])[0]

        # ------------------------------------
        # 3️⃣ Validate JWT (SimpleJWT way)
        # ------------------------------------
        if token:
            try:
                UntypedToken(token)  # ✅ verifies signature + expiry
                payload = UntypedToken(token).payload
                user_id = payload.get("user_id")

                if user_id:
                    user = await self.get_user(user_id)
                    if user:
                        scope["user"] = user
                        print(f"✅ WS Authenticated user {user.id}")
            except (InvalidToken, TokenError) as e:
                print("❌ WS Invalid token:", e)

        return await self.inner(scope, receive, send)

    # ------------------------------------
    # DB helper
    # ------------------------------------
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None