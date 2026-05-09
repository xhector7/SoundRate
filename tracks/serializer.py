from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Track, Comment, Follow, Rating, Favorite, Album, Genre, Profile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

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


# 🎧 TRACK
class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"
        read_only_fields = ["owner", "plays", "average_rating", "ratings_count"]


# 💬 COMMENT
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"





# ⭐ RATING
class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = "__all__"

        
    
    def validate(self, data):
        user = self.context["request"].user
        track = data["track"]

        if Rating.objects.filter(user=user, track=track).exists():
            raise serializers.ValidationError("Ya has calificado este track.")
        
        return data


# ❤️ FAVORITE
class FavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = "__all__"

    def validate(self, data):
        user = self.context["request"].user
        track = data["track"]

        if Favorite.objects.filter(user=user, track=track).exists():
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
        user = self.context["request"].user
        following = data["following"]

        if user == following:
            raise serializers.ValidationError("No puedes seguirte a ti mismo")

        if Follow.objects.filter(follower=user, following=following).exists():
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

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


from django.contrib.auth.models import User
from rest_framework import serializers

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