from rest_framework import viewsets, permissions
from .models import Track, Comment, Playlist, Follow
from .serializer import (
    TrackSerializer,
    CommentSerializer,
    PlaylistSerializer,
    FollowSerializer
)


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all().order_by("-created_at")
    serializer_class = TrackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]


from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "username and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, password=password)

    return Response(
        {"message": "user created successfully", "id": user.id},
        status=status.HTTP_201_CREATED
    )