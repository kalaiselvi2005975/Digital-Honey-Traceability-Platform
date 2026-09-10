from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HiveViewSet

router = DefaultRouter()
router.register('', HiveViewSet, basename='hive')

urlpatterns = [
    path('', include(router.urls)),
]
