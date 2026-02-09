from django.urls import path
from . import views

urlpatterns = [
    path('verify-pan/', views.verify_pan, name='verify_pan'),
]
