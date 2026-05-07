from rest_framework import viewsets, permissions
from .models import (
    Track, Comment, Follow, Rating,
    Favorite, Album, Genre, Profile
)
from .serializer import (
    TrackSerializer, CommentSerializer, FollowSerializer,
    RatingSerializer, FavoriteSerializer,
    AlbumSerializer, GenreSerializer, ProfileSerializer
)
from .permissions import IsOwnerOrReadOnly

# 🎧 TRACKS
class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all().order_by("-id")
    serializer_class = TrackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# 💬 COMMENTS
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by("-id")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ⭐ RATINGS
class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all().order_by("-id")
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    #recoge el request para poder usarlo en validaciones personalizadas (ej: evitar que un usuario califique un track mas de una vez)
    def get_serializer_context(self):
        return {"request": self.request}
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    


# 👥 FOLLOWS
class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all().order_by("-id")
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)


# ❤️ FAVORITES
class FavoriteViewSet(viewsets.ModelViewSet):
    queryset = Favorite.objects.all().order_by("-id")
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 💿 ALBUMS
class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all().order_by("-id")
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


# 🎼 GENRES
class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().order_by("-id")
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# 👤 PROFILE
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all().order_by("-id")
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)