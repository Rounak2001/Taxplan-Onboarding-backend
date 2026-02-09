from django.urls import path
from . import views

urlpatterns = [
    path('google/', views.google_auth, name='google_auth'),
    path('onboarding/', views.complete_onboarding, name='complete_onboarding'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('logout/', views.logout, name='logout'),
    path('health/', views.health_check, name='health_check'),
    path('expertise/', views.save_expertise, name='save_expertise'),
]
