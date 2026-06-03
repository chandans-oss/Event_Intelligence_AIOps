import os
import json
from adrf.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from pathlib import Path
from asgiref.sync import sync_to_async
import uuid

CURRENT_FILE = Path(__file__).resolve()
BACKEND_ROOT = CURRENT_FILE.parents[2]
REMEDY_KB_PATH = BACKEND_ROOT.parent / 'src' / 'data' / 'remedy' / 'fallback_sop.json'

class RemedyKBView(APIView):
    permission_classes = [AllowAny]

    def _read_kb(self):
        try:
            if not REMEDY_KB_PATH.exists():
                return []
            with open(REMEDY_KB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading Remedy KB: {e}")
            return []

    def _write_kb(self, data):
        try:
            REMEDY_KB_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(REMEDY_KB_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error writing Remedy KB: {e}")
            return False

    async def get(self, request):
        data = await sync_to_async(self._read_kb, thread_sensitive=False)()
        return Response(data, status=status.HTTP_200_OK)

    async def post(self, request):
        new_entry = request.data
        if not new_entry:
            return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

        data = await sync_to_async(self._read_kb, thread_sensitive=False)()
        
        # Ensure remedy_id is present
        remedy_id = new_entry.get('remedy_id')
        if not remedy_id:
            remedy_id = f"remedy_{uuid.uuid4().hex[:8]}"
            new_entry['remedy_id'] = remedy_id

        # Check for duplicates
        if any(e.get('remedy_id') == remedy_id for e in data):
            return Response({"error": "Entry with this remedy_id already exists"}, status=status.HTTP_400_BAD_REQUEST)

        data.append(new_entry)
        success = await sync_to_async(self._write_kb, thread_sensitive=False)(data)

        if success:
            return Response(new_entry, status=status.HTTP_201_CREATED)
        return Response({"error": "Failed to save Remedy KB"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def put(self, request):
        updated_entry = request.data
        remedy_id = updated_entry.get('remedy_id')
        if not remedy_id:
            return Response({"error": "remedy_id is required for update"}, status=status.HTTP_400_BAD_REQUEST)

        data = await sync_to_async(self._read_kb, thread_sensitive=False)()
        
        updated = False
        for i, entry in enumerate(data):
            if entry.get('remedy_id') == remedy_id or entry.get('sop_id') == remedy_id:
                data[i] = updated_entry
                updated = True
                break
        
        if not updated:
            return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)
            
        success = await sync_to_async(self._write_kb, thread_sensitive=False)(data)
        if success:
            return Response(updated_entry, status=status.HTTP_200_OK)
        return Response({"error": "Failed to save Remedy KB"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def delete(self, request):
        remedy_id = request.query_params.get('id')
        if not remedy_id:
            return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        data = await sync_to_async(self._read_kb, thread_sensitive=False)()
        new_data = [e for e in data if (e.get('remedy_id') or e.get('sop_id')) != remedy_id]

        if len(new_data) == len(data):
            return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

        success = await sync_to_async(self._write_kb, thread_sensitive=False)(new_data)
        if success:
            return Response({"status": "deleted"}, status=status.HTTP_200_OK)
        return Response({"error": "Failed to save Remedy KB"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
