from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.test_engine import TestTypeViewSet, UserSessionViewSet
from .views import face_matching

# Router for assessment viewsets
router = DefaultRouter()
router.register(r'assessment/test-types', TestTypeViewSet)
router.register(r'assessment/sessions', UserSessionViewSet)

urlpatterns = [
    # Assessment Routes (originally mounted at api/assessment/)
    path('', include(router.urls)),

    # Face Verification Routes (originally mounted at api/face-verification/)
    path('face-verification/users/<uuid:user_id>/upload-photo/', face_matching.upload_photo, name='upload-photo'),
    path('face-verification/users/<uuid:user_id>/verify-face/', face_matching.verify_face, name='verify-face'),
    
    # AI Tasks (ai_analysis didn't really have any public endpoints, so none are added here)
]
