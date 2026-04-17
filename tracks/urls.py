from django.urls import path, include
from rest_framework import routers
from . import views
from .views import register


router = routers.DefaultRouter()

router.register(r'tracks', views.TrackViewSet, basename='tracks')
router.register(r'comments', views.CommentViewSet, basename='comments')
router.register(r'playlists', views.PlaylistViewSet, basename='playlists')
router.register(r'follows', views.FollowViewSet, basename='follows')

urlpatterns = [
    path("", include(router.urls)), 
    path("register/", register), 
]