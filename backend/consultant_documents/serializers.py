from rest_framework import serializers
from .models import ConsultantDocument

class ConsultantDocumentSerializer(serializers.ModelSerializer):
    signed_url = serializers.SerializerMethodField()

    class Meta:
        model = ConsultantDocument
        fields = ['id', 'user', 'qualification_type', 'document_type', 'signed_url', 'uploaded_at']
        read_only_fields = ['user', 'uploaded_at']

    def get_signed_url(self, obj):
        try:
            from utils.supabase_client import get_supabase_client
            supabase = get_supabase_client()
            res = supabase.storage.from_("consultant_documents").create_signed_url(obj.file_path, 3600)
            if isinstance(res, dict) and 'signedURL' in res:
                 return res['signedURL']
            return res if isinstance(res, str) else res.get('signedURL', '')
        except Exception:
            return None
