from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()

router.register(r"tracks", views.TrackViewSet, basename="tracks")

urlpatterns = [
    path("", include(router.urls)),
]