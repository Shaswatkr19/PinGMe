import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
from channels.db import database_sync_to_async

User = get_user_model()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):

        # ------------------------------------
        # 1) Extract token from WebSocket header
        # ------------------------------------
        headers = dict(scope.get("headers", []))
        token = None

        if b"authorization" in headers:
            try:
                auth = headers[b"authorization"].decode()
                if auth.startswith("Bearer "):
                    token = auth.split(" ")[1]
            except:
                token = None

        # ------------------------------------
        # 2) Support token via ?token= query
        # ------------------------------------
        if not token:
            query = parse_qs(scope.get("query_string", b"").decode())
            token = query.get("token", [None])[0]

        # Default: Anonymous
        scope["user"] = None

        # ------------------------------------
        # 3) Validate JWT + Attach user to scope
        # ------------------------------------
        if token:
            try:
                # Match SimpleJWT: "user_id" field
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                user_id = payload.get("user_id")

                if user_id:
                    user = await self.get_user(user_id)

                    # IMPORTANT: must be a Django User object
                    if user:
                        scope["user"] = user
                    else:
                        print("JWT MIDDLEWARE: user not found")
                else:
                    print("JWT MIDDLEWARE: user_id missing")

            except jwt.ExpiredSignatureError:
                print("JWT MIDDLEWARE: token expired")
            except jwt.InvalidTokenError:
                print("JWT MIDDLEWARE: invalid token")

        else:
            print("JWT MIDDLEWARE: No token in request")

        return await self.inner(scope, receive, send)

    # ------------------------------------
    # DB fetch must be sync → wrapped async
    # ------------------------------------
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None