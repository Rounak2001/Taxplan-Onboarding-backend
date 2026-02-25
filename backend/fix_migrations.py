import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taxplan_backend.settings')
django.setup()

from django.db import connection

def fix_migration():
    with connection.cursor() as cursor:
        try:
            cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('consultant_core', '0001_initial', %s)", [timezone.now()])
            print("Successfully inserted consultant_core.0001_initial into django_migrations.")
        except Exception as e:
            print(f"Error inserting or already exists: {e}")

if __name__ == "__main__":
    fix_migration()
