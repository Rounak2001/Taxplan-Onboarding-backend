from rest_framework import serializers
from .models import User, ConsultantExpertise


class ConsultantExpertiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultantExpertise
        fields = ['domain', 'service']




class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'age', 'dob', 
            'phone_number', 'address', 'is_verified', 
            'is_onboarded', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'created_at']


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth token"""
    token = serializers.CharField(required=True)


class OnboardingSerializer(serializers.ModelSerializer):
    """Serializer for onboarding form submission"""
    
    class Meta:
        model = User
        fields = ['full_name', 'age', 'dob', 'phone_number', 'address', 'practice_type', 'business_name', 'years_of_experience']
    
    def validate_full_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError('Full name is required and must be at least 2 characters')
        return value.strip()
    
    def validate_age(self, value):
        if value is None or value < 18 or value > 100:
            raise serializers.ValidationError('Age must be between 18 and 100')
        return value
    
    def validate_phone_number(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError('Valid phone number is required')
        return value.strip()
    
    def validate_address(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError('Please enter a complete address')
        return value.strip()

    def validate(self, data):
        practice_type = data.get('practice_type')
        business_name = data.get('business_name')
        
        if practice_type and practice_type != 'Individual' and not business_name:
             raise serializers.ValidationError({'business_name': 'Business name is required for non-Individual practice types.'})
        return data
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.is_onboarded = True
        instance.save()
        return instance
