from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()

router.register(r"tracks", views.TrackViewSet, basename="tracks")
router.register(r"comments", views.CommentViewSet, basename="comments")
router.register(r"albums", views.AlbumViewSet, basename="albums")
router.register(r"genres", views.GenreViewSet, basename="genres")
router.register(r"ratings", views.RatingViewSet, basename="ratings")
router.register(r"favorites", views.FavoriteViewSet, basename="favorites")
router.register(r"follows", views.FollowViewSet, basename="follows")
router.register(r"profiles", views.ProfileViewSet, basename="profiles")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", views.RegisterView.as_view(), name="register"),
]