from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Track, Comment, Follow, Rating, Favorite, Album, Genre, Profile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count

# 👤 USER SIMPLE (para evitar problemas circulares)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


# 👤 PROFILE
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = "__all__"


# 🎵 GENRE
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = "__all__"


# 💿 ALBUM
class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "content",
            "track",
            "user",
            "timestamp",
            "created_at",
        ]


class TrackSerializer(serializers.ModelSerializer):

    # relaciones básicas
    genre = serializers.StringRelatedField()
    owner = UserSerializer(read_only=True)

    # métricas
    comments_count = serializers.IntegerField(source="comments_total", read_only=True)
    favorites_count = serializers.IntegerField(source="favorites_total", read_only=True)
    ratings_count = serializers.IntegerField(source="ratings_total", read_only=True)

    # UX del usuario actual (MUY IMPORTANTE)
    user_has_favorited = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    audio_file = serializers.FileField()
    cover_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Track
        fields = [
            "id",
            "title",
            "slug",
            "audio_file",
            "cover_image",
            "genre",
            "owner",

            # stats
            "plays",
            "average_rating",
            "comments_count",
            "favorites_count",
            "ratings_count",

            # user context
            "user_has_favorited",
            "user_rating",

            "created_at",
        ]

  

    # -------------------
    # USER CONTEXT (clave UX)
    # -------------------
    def get_user_has_favorited(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False

        return obj.favorites.filter(user=request.user).exists()

    def get_user_rating(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return None

        rating = obj.ratings.filter(user=request.user).first()
        return rating.score if rating else None


# ⭐ RATING serializer
class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = "__all__"

    def validate(self, data):
        # Sin validación de duplicado — lo maneja update_or_create en la view
        return data

# ❤️ FAVORITE
class FavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = "__all__"

    def validate(self, data):
        request = self.context.get("request")
        user = request.user if request else None
        track = data["track"]

        if user and Favorite.objects.filter(user=user, track=track).exists():
            raise serializers.ValidationError("Ya está en favoritos")

        return data


# 👥 FOLLOW
class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Follow
        fields = "__all__"

    def validate(self, data):
        request = self.context.get("request")
        user = request.user if request else None
        following = data["following"]

        if user and user == following:
            raise serializers.ValidationError("No puedes seguirte a ti mismo")

        if user and Follow.objects.filter(follower=user, following=following).exists():
            raise serializers.ValidationError("Ya sigues a este usuario")

        return data
    

    #aqui empiezan las apis tochas de la logica del resto de la app

#serializer del login, definimos que datos esperamos y que datos devolvemos y el error q lanzamos, eso define el serializer.
#la logica se hace en views, el serializer se encarga de validar y formatear los datos a JSON y de lanzar errores si los datos 
# no son correctos, pero no se encarga de la logica de autenticar al usuario, eso se hace en views, d hecho asi se hará en todos las apis de la app
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data["username"],
            password=data["password"]
        )

        if not user:
            raise serializers.ValidationError("Credenciales inválidas")

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username
            }
        }
    

#serializer del register, definimos que datos esperamos y que datos devolvemos y el error q lanzamos, eso define el serializer.
#la logica se hace en views, el serializer se encarga de validar y formatear los datos a JSON y de lanzar errores si los datos

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está en uso")
        return value

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError

        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    


class RecommendationSerializer(serializers.Serializer):
    key = serializers.CharField()
    title = serializers.CharField()
    tracks = TrackSerializer(many=True)


#serializer d perfiles de artistas q podemos ser nostros o un tio random

class ArtistProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    tracks = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    total_plays = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "user",
            "display_name",
            "avatar",
            "banner",
            "bio",
            "instagram_url",
            "twitter_url",
            "youtube_url",
            "soundcloud_url",
            "followers_count",
            "following_count",
            "total_plays",
            "is_following",
            "tracks",
            "created_at",
        ]

    def get_tracks(self, obj):
        tracks = Track.objects.filter(
            owner=obj.user, is_public=True
        ).annotate(
            comments_total=Count("comments"),
            favorites_total=Count("favorites"),
            ratings_total=Count("ratings"),
        ).order_by("-created_at")
        return TrackSerializer(tracks, many=True, context=self.context).data

    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj.user).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj.user).count()

    def get_total_plays(self, obj):
        from django.db.models import Sum
        result = Track.objects.filter(owner=obj.user).aggregate(Sum("plays"))
        return result["plays__sum"] or 0

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return Follow.objects.filter(follower=request.user, following=obj.user).exists()