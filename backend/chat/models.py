from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Thread(models.Model):
    # If 1:1 chat: name is blank
    name = models.CharField(max_length=255, blank=True)
    members = models.ManyToManyField(User, related_name='threads')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Thread {self.id}"

class Message(models.Model):
    thread = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    text = models.TextField(blank=True)
    attachment = models.FileField(
        upload_to="chat_media/",
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ NEW
    delivered_to = models.ManyToManyField(
        User,
        related_name="delivered_messages",
        blank=True
    )

    read_by = models.ManyToManyField(
        User,
        related_name="read_messages",
        blank=True
    )

    def __str__(self):
        return f"{self.sender}: {self.text[:20]}"