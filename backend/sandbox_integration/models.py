from django.db import models
from django.conf import settings

class SandboxToken(models.Model):
    """Stores the Sandbox API access token to handle 24h validity"""
    access_token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sandbox_tokens'
        verbose_name = 'Sandbox Token'
        verbose_name_plural = 'Sandbox Tokens'

    def __str__(self):
        return f"Token updated at {self.updated_at}"


class PANVerification(models.Model):
    """Stores the result of PAN verification for a user"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='pan_verification'
    )
    
    verified_full_name = models.CharField(max_length=255, blank=True)
    verified_dob = models.DateField(null=True, blank=True)
    
    full_name_match = models.BooleanField(default=False)
    dob_match = models.BooleanField(default=False)
    status = models.CharField(max_length=20)
    

    verified_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pan_verifications'
        verbose_name = 'PAN Verification'
        verbose_name_plural = 'PAN Verifications'

    def __str__(self):
        return f"{self.user.email} - {self.status}"
