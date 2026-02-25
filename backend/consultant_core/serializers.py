from rest_framework import serializers
from .models import (
    User, 
    AuthConsultantDocument, 
    ConsultantDocument, 
    PANVerification
)

# ----------------------------------------------------
# AUTHENTICATION SERIALIZERS
# ----------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name', 
            'age', 'dob', 'phone_number', 
            'address_line1', 'address_line2', 'city', 'state', 'pincode', 
            'practice_type', 'years_of_experience',
            'is_verified', 'is_onboarded', 'has_accepted_declaration', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'has_accepted_declaration', 'created_at']


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth token"""
    token = serializers.CharField(required=True)


class OnboardingSerializer(serializers.ModelSerializer):
    """Serializer for onboarding form submission"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name', 
            'age', 'dob', 'phone_number', 
            'address_line1', 'address_line2', 'city', 'state', 'pincode',
            'practice_type', 'years_of_experience'
        ]
    
    def validate_first_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError('First name is required')
        return value.strip()

    def validate_last_name(self, value):
        if not value or len(value.strip()) < 1:
            raise serializers.ValidationError('Last name is required')
        return value.strip()
    
    def validate_age(self, value):
        if value is None or value < 18 or value > 100:
            raise serializers.ValidationError('Age must be between 18 and 100')
        return value
    
    def validate_phone_number(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError('Valid phone number is required')
        return value.strip()
    
    def validate_address_line1(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError('Address Line 1 is required')
        return value.strip()
        
    def validate_city(self, value):
        if not value:
            raise serializers.ValidationError('City is required')
        return value.strip()

    def validate_state(self, value):
        if not value:
            raise serializers.ValidationError('State is required')
        return value.strip()

    def validate_pincode(self, value):
        if not value or len(value.strip()) < 6:
            raise serializers.ValidationError('Valid Pincode is required')
        return value.strip()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.is_onboarded = True
        instance.save()
        return instance


class AuthConsultantDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthConsultantDocument
        fields = ['id', 'document_type', 'title', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


# ----------------------------------------------------
# CONSULTANT_DOCUMENTS SERIALIZERS
# ----------------------------------------------------

class ConsultantDocumentSerializer(serializers.ModelSerializer):
    signed_url = serializers.SerializerMethodField()

    class Meta:
        model = ConsultantDocument
        fields = ['id', 'user', 'qualification_type', 'document_type', 'signed_url', 'uploaded_at', 'verification_status', 'gemini_raw_response']
        read_only_fields = ['user', 'uploaded_at']

    def get_signed_url(self, obj):
        try:
            from django.core.files.storage import default_storage
            if obj.file_path:
                return default_storage.url(obj.file_path)
            if hasattr(obj, 'file') and obj.file:
                return default_storage.url(str(obj.file))
            return None
        except Exception:
            return None


# ----------------------------------------------------
# SANDBOX_INTEGRATION SERIALIZERS
# ----------------------------------------------------

class PANVerificationRequestSerializer(serializers.Serializer):
    pan = serializers.RegexField(
        regex=r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', 
        required=True, 
        error_messages={
            'invalid': 'Invalid PAN format. Must be 10 characters (5 letters, 4 numbers, 1 letter).'
        }
    )
    full_name = serializers.CharField(required=True, min_length=2)
    dob = serializers.DateField(input_formats=['%d/%m/%Y'], required=True)

class PANVerificationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PANVerification
        fields = ['verified_full_name', 'verified_dob', 'full_name_match', 'dob_match', 'status', 'verified_at']
