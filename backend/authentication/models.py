import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, google_id=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, google_id=google_id, **extra_fields)
        user.set_unusable_password()  
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_onboarded', True)
        
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model for TaxplanAdvisor consultants"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    # Onboarding fields
    full_name = models.CharField(max_length=255, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Practice Details
    PRACTICE_TYPE_CHOICES = [
        ('Individual', 'Individual'),
        ('LLP', 'LLP'),
        ('Firm', 'Firm'),
        ('Partnership', 'Partnership'),
        ('Company', 'Company'),
    ]
    practice_type = models.CharField(max_length=50, choices=PRACTICE_TYPE_CHOICES, null=True, blank=True)
    business_name = models.CharField(max_length=255, null=True, blank=True)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    
    # Status fields
    is_verified = models.BooleanField(default=False)
    is_onboarded = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return self.full_name or self.email
    
    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email.split('@')[0]


class ConsultantExpertise(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expertise')
    domain = models.CharField(max_length=100) 
    service = models.CharField(max_length=200) 

    class Meta:
        db_table = 'consultant_expertise'
        unique_together = ('user', 'domain', 'service')
        verbose_name = 'Consultant Expertise'
        verbose_name_plural = 'Consultant Expertises'

    def __str__(self):
        return f"{self.user.email} - {self.service}"
