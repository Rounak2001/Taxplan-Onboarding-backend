from rest_framework import serializers
from .models import PANVerification

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
