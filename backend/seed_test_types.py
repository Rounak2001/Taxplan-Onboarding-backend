import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taxplan_backend.settings')
django.setup()

from assessment.models import TestType

TEST_TYPES = [
    {"name": "GST", "slug": "gst"},
    {"name": "Income Tax", "slug": "income-tax"},
    {"name": "TDS", "slug": "tds"},
    {"name": "Professional Tax", "slug": "professional-tax"},
]

for t in TEST_TYPES:
    obj, created = TestType.objects.get_or_create(slug=t["slug"], defaults={"name": t["name"]})
    if created:
        print(f"Created: {obj.name}")
    else:
        print(f"Exists: {obj.name}")
