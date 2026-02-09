from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .client import SandboxClient
from .models import PANVerification
from .serializers import PANVerificationRequestSerializer, PANVerificationResponseSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_pan(request):
    """
    Verify PAN details against the user's registered name and DOB.
    """
    serializer = PANVerificationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    pan = serializer.validated_data['pan']
    full_name = serializer.validated_data['full_name']
    dob_date = serializer.validated_data['dob']
    user = request.user
    
    # Format DOB as DD/MM/YYYY 
    dob_str = dob_date.strftime('%d/%m/%Y')
    
    client = SandboxClient()
    
    try:
        response = client.verify_pan(
            pan=pan,
            name_as_per_pan=full_name,
            date_of_birth=dob_str
        )
        
        
        if response.status_code != 200:
            return Response(
                {'error': 'Verification API failed', 'details': response.text}, 
                status=status.HTTP_502_BAD_GATEWAY
            )
            
        data = response.json()
        
        
        result_data = data.get('data', {})
        api_status = result_data.get('status')
        name_match = result_data.get('name_as_per_pan_match', False)
        dob_match = result_data.get('date_of_birth_match', False)
        
        # Create or update verification record
        verification, created = PANVerification.objects.update_or_create(
            user=user,
            defaults={
                'verified_full_name': full_name,
                'verified_dob': dob_date,
                'full_name_match': name_match,
                'dob_match': dob_match,
                'status': api_status
            }
        )
        
        
        response_data = PANVerificationResponseSerializer(verification).data
        
        if api_status == 'valid' and name_match:
             return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    'error': 'Verification Failed', 
                    'details': f"Status: {api_status}. Name Match: {name_match}. DOB Match: {dob_match}",
                    'data': response_data
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'Internal Error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
