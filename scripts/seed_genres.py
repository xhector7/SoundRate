from api.models import Genre

GENRES = [
    ("Ambient", "ambient"),
    ("Synthwave", "synthwave"),
    ("Electronic", "electronic"),
    ("Chillwave", "chillwave"),
    ("IDM", "idm"),
    ("House", "house"),
    ("Drum & Bass", "drum-and-bass"),
    ("Hyperpop", "hyperpop"),

    ("Lo-Fi", "lo-fi"),
    ("Chill", "chill"),
    ("Night Drive", "night-drive"),
    ("Sunset", "sunset"),
    ("Late Night", "late-night"),
    ("Summer Vibes", "summer-vibes"),

    ("Reggaeton", "reggaeton"),
    ("Trap", "trap"),
    ("Latin Trap", "latin-trap"),
    ("Alternative R&B", "alternative-rnb"),
    ("Cloud Rap", "cloud-rap"),
    ("Flamenco Urbano", "flamenco-urbano"),

    ("Indie Pop", "indie-pop"),
    ("Dream Pop", "dream-pop"),
    ("Shoegaze", "shoegaze"),
    ("Bedroom Pop", "bedroom-pop"),

    ("Industrial", "industrial"),
    ("Glitchcore", "glitchcore"),
    ("Darkwave", "darkwave"),
    ("Neo Soul", "neo-soul"),
    ("Future Garage", "future-garage"),

    ("Metal", "metal"),
    ("Mariachi", "mariachi"),
]

for name, slug in GENRES:
    genre, created = Genre.objects.get_or_create(
        slug=slug,
        defaults={"name": name}
    )

    if created:
        print(f"✅ Created: {name}")
    else:
        print(f"⚡ Already exists: {name}")

print("\n🎵 Genres loaded successfully.")