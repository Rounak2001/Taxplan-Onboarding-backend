from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # New Consolidated Core Apps
    path('api/', include('consultant_core.urls')),
    path('api/', include('consultant_assessment.urls')),
]
