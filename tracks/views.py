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
from django.db.models import F, Count, FloatField, ExpressionWrapper
from django.utils import timezone

from .serializer import LoginSerializer, RegisterSerializer  
from .serializer import ArtistProfileSerializer
from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action

class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all().annotate(
        comments_total=Count("comments"),
        favorites_total=Count("favorites"),
        ratings_total=Count("ratings"),
    ).order_by("-id")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        genre = self.request.query_params.get("genre")
        if genre:
            queryset = queryset.filter(genre_id=genre)
        return queryset

    def get_serializer_class(self):
        return TrackSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# 💬 COMMENTS

class CommentViewSet(viewsets.ModelViewSet):

    queryset = Comment.objects.all().order_by("-id")
    serializer_class = CommentSerializer

    def get_queryset(self):
        queryset = Comment.objects.all().order_by("-id")
        track_id = self.request.query_params.get("track")

        if track_id:
            queryset = queryset.filter(track_id=track_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ⭐ RATINGS
class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user).order_by("-id")

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        instance, _ = Rating.objects.update_or_create(
            user=self.request.user,
            track=serializer.validated_data["track"],
            defaults={"score": serializer.validated_data["score"]}
        )
        instance.track.update_rating_stats()


# 👥 FOLLOWS
class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all().order_by("-id")
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)
    @action(detail=False, methods=['post'], url_path='toggle/(?P<username>[^/.]+)')
    def toggle_follow(self, request, username=None):
        try:
            following = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)
        
        user = request.user
        
        if user == following:
            return Response({"error": "No puedes seguirte a ti mismo"}, status=400)
        
        follow = Follow.objects.filter(follower=user, following=following)
        
        if follow.exists():
            follow.delete()
            return Response({"following": False, "followers_count": following.followers.count()})
        else:
            Follow.objects.create(follower=user, following=following)
            return Response({"following": True, "followers_count": following.followers.count()})


# ❤️ FAVORITES
class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by("-id")

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # 👇 nuevo
    @action(detail=False, methods=["delete"], url_path="by-track/(?P<track_id>[^/.]+)")
    def by_track(self, request, track_id=None):
        fav = Favorite.objects.filter(user=request.user, track_id=track_id).first()
        if not fav:
            return Response(status=status.HTTP_404_NOT_FOUND)
        fav.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# 💿 ALBUMS
class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all().order_by("-id")
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


# 🎼 GENRES
class GenreViewSet(viewsets.ModelViewSet):
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Genre.objects.all().order_by("name")
        slug = self.request.query_params.get("slug")
        if slug:
            queryset = queryset.filter(slug=slug)
        # solo géneros con tracks públicos
        only_with_tracks = self.request.query_params.get("with_tracks")
        if only_with_tracks:
            queryset = queryset.filter(tracks__is_public=True).distinct()
        return queryset


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
            
            # 👇 CREA EL PERFIL MANUALMENTE
            Profile.objects.create(
                user=user,
                display_name=user.username  # Así el nombre se guarda
            )

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
            "tracks": TrackSerializer(tracks, many=True, context={"request": request}).data  # ✅ or []
        })


# ☀️ SEASONAL
SUMMER_GENRES = ["Reggaeton", "Pop", "EDM", "Afrobeats", "Chill", "Flamenco Urbano", "Electronic"]

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
            "tracks": TrackSerializer(tracks, many=True, context={"request": request}).data   or []
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
            "tracks": TrackSerializer(tracks, many=True, context={"request": request}).data or []
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
            .exclude(owner=user)
            .order_by("-average_rating", "-plays")[:20]
        )

        return Response({
            "key": "taste",
            "title": "Para ti",
            "tag": "PARA TI",
            "tracks": TrackSerializer(tracks, many=True, context={"request": request}).data or []
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
        

#mostrara canciones relacionadas a la que se esta reproduciendo, para fomentar el descubrimiento de musica similar,
#  y aumentar el tiempo de uso de la app, y la satisfaccion del usuario, esto es un ejemplo de como a veces hay que crear apis muy especificas para ciertas funcionalidades, y no siempre todo se puede meter en un mismo endpoint
class RelatedTracksView(APIView):
    def get(self, request, track_id):
        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        related = (
            Track.objects.filter(is_public=True, genre=track.genre)
            .exclude(id=track_id)
            .annotate(
                comments_total=Count("comments"),
                favorites_total=Count("favorites"),
                ratings_total=Count("ratings"),
            )
            .order_by("-plays")[:10]
        )

        return Response(TrackSerializer(related, many=True, context={"request": request}).data)
    

#api de perfil d artista publico, nosotros o un random


class ArtistProfileView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        profile, _ = Profile.objects.get_or_create(user=user)

        serializer = ArtistProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)
    


# Añade este método a tu ProfileViewSet o crea una vista dedicada
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Profile.objects.all()
        return Profile.objects.none()

    # 👇 AÑADE ESTO COMPLETO
    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        profile = request.user.profile
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            print("Errores:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        


class SearchView(APIView):
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"tracks": [], "artists": [], "genres": []})

        tracks = Track.objects.filter(
            is_public=True,
            title__icontains=q
        ).annotate(
            comments_total=Count("comments"),
            favorites_total=Count("favorites"),
            ratings_total=Count("ratings"),
        ).order_by("-plays")[:8]

        artists = User.objects.filter(
            username__icontains=q
        ).values("id", "username")[:5]

        genres = Genre.objects.filter(
            name__icontains=q
        ).values("id", "name", "slug")[:5]

        return Response({
            "tracks": TrackSerializer(tracks, many=True, context={"request": request}).data,
            "artists": list(artists),
            "genres": list(genres),
        })
    

   #ranking por genero segun repros y puntuacion 
class TrendingView(APIView):
    def get(self, request):
        genre_slug = request.query_params.get("genre", None)

        tracks = Track.objects.filter(is_public=True).annotate(
            comments_total=Count("comments"),
            favorites_total=Count("favorites"),
            ratings_total=Count("ratings"),
            score=ExpressionWrapper(
                F("plays") + F("average_rating") * 10,
                output_field=FloatField(),
            )
        )

        if genre_slug:
            tracks = tracks.filter(genre__slug=genre_slug)

        tracks = tracks.order_by("-score")[:50]

        return Response({
            "tracks": TrackSerializer(tracks, many=True, context={"request": request}).data
        })