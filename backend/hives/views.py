from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Hive
from .serializers import HiveSerializer, HiveCreateSerializer, HiveObservationSerializer
from .permissions import IsBeekeeperOrAdmin, IsHiveOwnerOrAdmin
from .services import ensure_starter_hives
from ai_services.hive_health import predict_hive_health
from ai_services.forecast import predict_production


class HiveViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsBeekeeperOrAdmin]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return Hive.objects.select_related('beekeeper').all()
        return Hive.objects.filter(beekeeper=user)

    def list(self, request, *args, **kwargs):
        ensure_starter_hives(request.user)
        return super().list(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return HiveCreateSerializer
        return HiveSerializer

    def perform_create(self, serializer):
        serializer.save(beekeeper=self.request.user)

    def get_permissions(self):
        if self.action in ('retrieve', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsBeekeeperOrAdmin(), IsHiveOwnerOrAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['get', 'post'], url_path='observations')
    def observations(self, request, pk=None):
        hive = self.get_object()
        if request.method == 'GET':
            obs = hive.observations.select_related('created_by').all()
            return Response(HiveObservationSerializer(obs, many=True).data)
        serializer = HiveObservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        observation = serializer.save(hive=hive, created_by=request.user)
        hive.health_status = observation.health_status
        hive.save(update_fields=['health_status', 'updated_at'])
        return Response(HiveObservationSerializer(observation).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='health')
    def health(self, request, pk=None):
        hive = self.get_object()
        result = predict_hive_health(hive)
        return Response(result)

    @action(detail=True, methods=['get'], url_path='forecast')
    def forecast(self, request, pk=None):
        hive = self.get_object()
        result = predict_production(hive)
        return Response(result)
