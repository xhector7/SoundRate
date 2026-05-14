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
    path("login/", views.LoginView.as_view()),
    path("register/", views.RegisterView.as_view()),
    path("recommendations/trending/", views.TrendingRecommendationsView.as_view()),
    path("recommendations/seasonal/", views.SeasonalRecommendationsView.as_view()),
    path("recommendations/emerging/", views.EmergingRecommendationsView.as_view()),
    path("recommendations/taste/", views.TasteRecommendationsView.as_view()),
    path("tracks/<int:track_id>/play/", views.IncrementPlayView.as_view()),
    path("tracks/<int:track_id>/related/", views.RelatedTracksView.as_view()),
    path("artist/<str:username>/", views.ArtistProfileView.as_view()),
    path("search/", views.SearchView.as_view()),
    path("trending/", views.TrendingView.as_view()),
]