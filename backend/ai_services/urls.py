from django.urls import path
from .views import HiveImageAnalysisView

urlpatterns = [
    path('hive-image-analysis/', HiveImageAnalysisView.as_view(), name='ai-hive-image'),
]
