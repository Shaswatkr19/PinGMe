from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Users app URLs
    path('api/auth/', include('users.urls')),
    path("api/chat/", include("chat.urls")),
]