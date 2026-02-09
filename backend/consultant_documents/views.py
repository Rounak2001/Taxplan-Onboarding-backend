from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from supabase import create_client, Client
from .models import ConsultantDocument
from .serializers import ConsultantDocumentSerializer
import os
import time

class UploadDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        qualification_type = request.data.get('qualification_type')
        document_type = request.data.get('document_type')
        file_obj = request.FILES.get('file')

        if not all([qualification_type, document_type, file_obj]):
            return Response({'error': 'Missing required fields'}, status=400)

        # Initialize Supabase Client
        from utils.supabase_client import get_supabase_client
        supabase = get_supabase_client()

        # Create unique file path: user_id/timestamp_filename
        timestamp = int(time.time())
        file_path = f"{user.id}/{timestamp}_{file_obj.name}"
        bucket_name = "consultant_documents"

        try:
            # Upload file to Supabase
            file_content = file_obj.read()
            res = supabase.storage.from_(bucket_name).upload(
                file=file_content,
                path=file_path,
                file_options={"content-type": file_obj.content_type}
            )

            # Save to Database with empty public_url since we use signed URLs now
            document = ConsultantDocument.objects.create(
                user=user,
                qualification_type=qualification_type,
                document_type=document_type,
                file_path=file_path
            )

            serializer = ConsultantDocumentSerializer(document)
            return Response(serializer.data, status=201)

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        documents = ConsultantDocument.objects.filter(user=user).order_by('-uploaded_at')
        serializer = ConsultantDocumentSerializer(documents, many=True)
        return Response(serializer.data)
