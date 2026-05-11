from django.db import models
from django.contrib.auth.models import User


# =========================
# GENRE
# =========================

class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


# =========================
# PROFILE (ARTISTA / USUARIO)
# =========================

class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    display_name = models.CharField(max_length=100)

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True
    )

    banner = models.ImageField(
        upload_to="banners/",
        blank=True,
        null=True
    )

    bio = models.TextField(blank=True)

    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    soundcloud_url = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name


# =========================
# ALBUM
# =========================

class Album(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="albums"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    cover_image = models.ImageField(
        upload_to="albums/",
        blank=True,
        null=True
    )

    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    slug = models.SlugField(unique=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# =========================
# TRACK (CORE)
# =========================

class Track(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tracks"
    )

    album = models.ForeignKey(
        Album,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tracks"
    )

    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        related_name="tracks"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    audio_file = models.FileField(upload_to="tracks/")

    cover_image = models.ImageField(
        upload_to="covers/",
        blank=True,
        null=True
    )

    slug = models.SlugField(unique=True, blank=True)

    duration = models.PositiveIntegerField(default=0)

    plays = models.PositiveIntegerField(default=0)

    average_rating = models.FloatField(default=0)
    ratings_count = models.PositiveIntegerField(default=0)

    is_public = models.BooleanField(default=True)

    track_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    def update_rating_stats(self):
        from django.db.models import Avg
        ratings = self.ratings.all()
        self.ratings_count = ratings.count()
        self.average_rating = ratings.aggregate(Avg("score"))["score__avg"] or 0
        self.save(update_fields=["average_rating", "ratings_count"])

    def __str__(self):
        return self.title


# =========================
# RATING (CORE DIFERENCIAL)
# =========================

class Rating(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="ratings"
    )

    score = models.PositiveSmallIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "track")

        


# =========================
# COMMENT
# =========================

class Comment(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    content = models.TextField()

    timestamp = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)


# =========================
# FAVORITE
# =========================

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="favorites"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "track")


# =========================
# FOLLOW
# =========================

class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="following_users"
    )

    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="followers"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")