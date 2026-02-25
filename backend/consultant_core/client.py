import requests
import datetime
from django.conf import settings
from django.utils import timezone
from .models import SandboxToken

class SandboxClient:
    def __init__(self):
        self.api_key = settings.SANDBOX_API_KEY
        self.api_secret = settings.SANDBOX_API_SECRET
        self.base_url = settings.SANDBOX_BASE_URL
        
    def _get_auth_headers(self, token=None):
        headers = {
            "x-api-key": self.api_key,
            "x-api-secret": self.api_secret,
            "Content-Type": "application/json"
        }
        if token:
            headers["Authorization"] = token
        return headers

    def authenticate(self):
        """
        Authenticate with Sandbox API to get a new access token.
        Always creates a new token.
        """
        url = f"{self.base_url}/authenticate"
        headers = {
            "x-api-key": self.api_key,
            "x-api-secret": self.api_secret
        }
        
        try:
            response = requests.post(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            access_token = data.get("data", {}).get("access_token")
            if not access_token:
                raise Exception("No access token in response")
                
            SandboxToken.objects.all().delete()
            SandboxToken.objects.create(access_token=access_token)
            
            return access_token
        except Exception as e:
            print(f"Sandbox Authentication Failed: {e}")
            raise

    def get_valid_token(self):
        """
        Get a valid access token. 
        Checks DB first. If expired (>23h) or missing, authenticates again.
        """
        token_obj = SandboxToken.objects.first()
        
        if token_obj:
            # Check age
            now = timezone.now()
            age = now - token_obj.created_at
            # Token is valid for 24h, refresh if older than 23h to be safe
            if age < datetime.timedelta(hours=23):
                return token_obj.access_token
        
        # If we are here, we need a new token
        return self.authenticate()

    def verify_pan(self, pan, name_as_per_pan, date_of_birth, consent="Y", reason="Onboarding"):
        """
        Verify PAN details against Sandbox API.
        """
        token = self.get_valid_token()
        url = f"{self.base_url}/kyc/pan/verify"
        
        payload = {
            "@entity": "in.co.sandbox.kyc.pan_verification.request",
            "pan": pan,
            "name_as_per_pan": name_as_per_pan,
            "date_of_birth": date_of_birth,
            "consent": consent,
            "reason": reason
        }
        
        headers = self._get_auth_headers(token)
        
        response = requests.post(url, json=payload, headers=headers)
        
        
        return response
