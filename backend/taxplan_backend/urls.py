from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/sandbox/', include('sandbox_integration.urls')),
    path('api/documents/', include('consultant_documents.urls')),
    path('api/face-verification/', include('face_verification.urls')),
]
