from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import User, ConsultantExpertise
from .serializers import UserSerializer, GoogleAuthSerializer, OnboardingSerializer, ConsultantExpertiseSerializer
from .authentication import generate_jwt_token


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate user via Google OAuth token.
    Creates new user if not exists, returns JWT token in cookie.
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    token = serializer.validated_data['token']
    
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get('email')
        google_id = idinfo.get('sub')
        name = idinfo.get('name', '')
        
        if not email:
            return Response(
                {'error': 'Email not provided by Google'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'google_id': google_id,
                'full_name': name,
            }
        )
        
        # Update google_id if user exists but doesn't have one
        if not created and not user.google_id:
            user.google_id = google_id
            user.save()
        
        # Generate JWT token
        jwt_token = generate_jwt_token(user)
        
        # Create response with user data
        response_data = {
            'user': UserSerializer(user).data,
            'is_new_user': created,
            'needs_onboarding': not user.is_onboarded,
        }
        
        response = Response(response_data, status=status.HTTP_200_OK)
        
        # Set JWT token in HttpOnly cookie (3 hours = 10800 seconds)
        response.set_cookie(
            key='jwt_token',
            value=jwt_token,
            max_age=3 * 60 * 60,  
            httponly=True,
            samesite='Lax',
            secure=False,  # Set to True in production with HTTPS
        )
        
        return response
        
    except ValueError as e:
        return Response(
            {'error': f'Invalid Google token: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Authentication failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    Complete user onboarding with profile details.
    """
    serializer = OnboardingSerializer(data=request.data, instance=request.user)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.save()
    
    return Response({
        'message': 'Details submitted successfully',
        'user': UserSerializer(user).data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get current user's profile"""
    return Response({
        'user': UserSerializer(request.user).data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """Logout user by clearing the JWT cookie"""
    response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    response.delete_cookie('jwt_token')
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'ok'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_expertise(request):
    """
    Save consultant expertise.
    Expected format: 
    {
        "expertise": [
            {"domain": "GST", "services": ["Registration", "Filing"]},
            ...
        ]
    }
    """
    user = request.user
    expertise_data = request.data.get('expertise', [])
    
    if not expertise_data:
        return Response({'error': 'No expertise data provided'}, status=status.HTTP_400_BAD_REQUEST)

    # validate structure
    if not isinstance(expertise_data, list):
         return Response({'error': 'Invalid format. "expertise" must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Clear existing expertise for full update (simplest strategy)
        ConsultantExpertise.objects.filter(user=user).delete()
        
        new_entries = []
        for item in expertise_data:
            domain = item.get('domain')
            services = item.get('services', [])
            
            if not domain or not services:
                continue
                
            for service in services:
                new_entries.append(ConsultantExpertise(
                    user=user,
                    domain=domain,
                    service=service
                ))
        
        ConsultantExpertise.objects.bulk_create(new_entries)
        
        return Response({'message': 'Expertise saved successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
