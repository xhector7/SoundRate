from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def confirm_email_redirect(request, key):
    return HttpResponseRedirect(f"https://soundrate.ieti.site/verify-email/{key}/")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("tracks.urls")),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Redirige el enlace del email al frontend
    path("api/auth/registration/account-confirm-email/<str:key>/", confirm_email_redirect),

    # Autenticación por email con dj_rest_auth
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)