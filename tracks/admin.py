from django.contrib import admin
from .models import Track, Comment, Follow, Rating, Favorite, Album, Genre, Profile

admin.site.register(Track)
admin.site.register(Comment)
admin.site.register(Follow)
admin.site.register(Rating)
admin.site.register(Favorite)
admin.site.register(Album)
admin.site.register(Genre)
admin.site.register(Profile)