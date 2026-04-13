from django.contrib import admin
from .models import Track, Comment, Playlist, Follow

admin.site.register(Track)
admin.site.register(Comment)
admin.site.register(Playlist)
admin.site.register(Follow)