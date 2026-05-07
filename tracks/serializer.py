from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Track, Comment, Follow, Rating, Favorite, Album, Genre, Profile


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