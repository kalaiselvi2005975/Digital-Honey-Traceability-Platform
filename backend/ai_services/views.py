from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid

from .image_detection import analyze_hive_image


class HiveImageAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    MAX_SIZE = 5 * 1024 * 1024
    ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}

    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if image.size > self.MAX_SIZE:
            return Response({'error': 'Image too large (max 5MB).'}, status=status.HTTP_400_BAD_REQUEST)

        if image.content_type not in self.ALLOWED_TYPES:
            return Response({'error': 'Invalid image type. Use JPEG, PNG, or WebP.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(image.name)[1].lower() or '.jpg'
        safe_name = f'hive_images/{uuid.uuid4().hex}{ext}'
        path = default_storage.save(safe_name, ContentFile(image.read()))
        full_path = default_storage.path(path)

        result = analyze_hive_image(full_path)
        result['image_path'] = path
        return Response(result)
