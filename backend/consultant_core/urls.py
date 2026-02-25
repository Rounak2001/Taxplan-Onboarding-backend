from django.urls import path

# Import views from the different core modules
from .views import auth as auth_views
from .views import documents as doc_views
from .views import sandbox as sandbox_views
from .views import admin as admin_views

urlpatterns = [
    # Authentication & Onboarding (originally api/auth/...)
    path('auth/google/', auth_views.google_auth, name='google_auth'),
    path('auth/onboarding/', auth_views.complete_onboarding, name='complete_onboarding'),
    path('auth/profile/', auth_views.get_user_profile, name='get_user_profile'),
    path('auth/accept-declaration/', auth_views.accept_declaration, name='accept_declaration'),
    path('auth/logout/', auth_views.logout, name='logout'),
    path('auth/health/', auth_views.health_check, name='health_check'),

    # Auth Documents (originally api/auth/documents/...)
    path('auth/documents/upload/', auth_views.upload_document, name='auth_upload_document'),
    path('auth/documents/list/', auth_views.get_user_documents, name='auth_get_user_documents'),

    # Identity Documents (originally api/auth/identity/...)
    path('auth/identity/upload-doc/', auth_views.upload_identity_document, name='upload_identity_document'),

    # Consultant Qualification Documents (originally api/documents/...)
    path('documents/upload/', doc_views.UploadDocumentView.as_view(), name='document-upload'),
    path('documents/list/', doc_views.DocumentListView.as_view(), name='document-list'),

    # Sandbox / PAN Verification (originally not wired properly? Let's check where it was, maybe api/sandbox/...)
    path('sandbox/verify-pan/', sandbox_views.verify_pan, name='verify_pan'),

    # Admin Panel (originally api/admin-panel/...)
    path('admin-panel/login/', admin_views.admin_login, name='admin_login'),
    path('admin-panel/consultants/', admin_views.consultant_list, name='admin_consultant_list'),
    path('admin-panel/consultants/<uuid:user_id>/', admin_views.consultant_detail, name='admin_consultant_detail'),
    path('admin-panel/consultants/<uuid:user_id>/generate-credentials/', admin_views.generate_credentials, name='generate_credentials'),
]
