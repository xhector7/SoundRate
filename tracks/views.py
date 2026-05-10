from datetime import timedelta

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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import LoginSerializer
from .serializer import RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import F, FloatField, ExpressionWrapper
from django.utils import timezone




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



#viewsets de las apis tochas:@@@@@@@@@@@@@@@@@@@@@@@@

#LOGIN
#logica de login, de autenticacion, aqui en views creamos el metodo q se encarga de enviar el token al front una vez
#  llega el request con el username y password, y compruebe q son correctos en la bd
class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#  REGISTER

class RegisterView(APIView):
    
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class TrendingRecommendationsView(APIView):
    def get(self, request):
        tracks = (
            Track.objects.filter(is_public=True)
            .annotate(
                score=ExpressionWrapper(
                    F("plays") * 1.5 + F("average_rating") * 10,
                    output_field=FloatField(),
                )
            )
            .order_by("-score")[:20]
        )

        return Response({
            "key": "trending",
            "title": "Trending ahora",
            "tag": "POPULAR",
            "tracks": TrackSerializer(tracks, many=True).data or []
        })


# ☀️ SEASONAL
SUMMER_GENRES = ["Reggaeton", "Pop", "EDM", "Afrobeats", "Chill"]

class SeasonalRecommendationsView(APIView):
    def get(self, request):
        tracks = (
            Track.objects.filter(
                is_public=True,
                genre__name__in=SUMMER_GENRES
            )
            .order_by("-plays", "-average_rating")[:20]
        )

        return Response({
            "key": "seasonal",
            "title": "Verano vibes",
            "tag": "SEASONAL",
            "tracks": TrackSerializer(tracks, many=True).data or []
        })


# 🌱 EMERGING
class EmergingRecommendationsView(APIView):
    def get(self, request):
        recent = timezone.now() - timedelta(days=30)

        tracks = (
            Track.objects.filter(
                is_public=True,
                created_at__gte=recent
            )
            .order_by("-created_at")[:20]
        )

        return Response({
            "key": "emerging",
            "title": "Artistas emergentes",
            "tag": "NUEVO",
            "tracks": TrackSerializer(tracks, many=True).data or []
        })


# ❤️ TASTE (PROTECTED)
class TasteRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        genres = Rating.objects.filter(
            user=user
        ).values_list("track__genre__name", flat=True)

        tracks = (
            Track.objects.filter(
                is_public=True,
                genre__name__in=list(genres)
            )
            .exclude(ratings__user=user)
            .order_by("-average_rating", "-plays")[:20]
        )

        return Response({
            "key": "taste",
            "title": "Para ti",
            "tag": "PARA TI",
            "tracks": TrackSerializer(tracks, many=True).data or []
        })
    

#basicamente q cada vez q se reproduzca una cancion, se envie un request a esta api para que se incremente el contador de
#  reproducciones, y asi poder usar ese dato para recomendaciones y demas, esto parece una tonteria pero lo es todo 
# para poder tener un sistema de recomendaciones decente, y es un ejemplo de como
#  a veces hay que crear apis muy especificas para ciertas funcionalidades
class IncrementPlayView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, track_id):
        try:
            track = Track.objects.get(id=track_id)

            track.plays = F("plays") + 1
            track.save()

            track.refresh_from_db()

            return Response({
                "plays": track.plays
            })

        except Track.DoesNotExist:
            return Response(
                {"error": "Track not found"},
                status=status.HTTP_404_NOT_FOUND
            )