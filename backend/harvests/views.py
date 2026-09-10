from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Harvest
from .serializers import HarvestSerializer, HarvestCreateSerializer
from hives.permissions import IsBeekeeperOrAdmin
from traceability.services import TraceabilityService


class HarvestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsBeekeeperOrAdmin]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs = Harvest.objects.select_related('hive', 'batch', 'beekeeper')
        if user.is_admin_user:
            return qs.all()
        return qs.filter(beekeeper=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return HarvestCreateSerializer
        return HarvestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        harvest = serializer.save(beekeeper=request.user)

        batch_id = request.data.get('batch_id')
        if batch_id:
            from batches.models import HoneyBatch
            from batches.services import BatchService
            batch, _ = BatchService.create_from_harvest(harvest, batch_id, request.user)
            harvest.batch = batch
            harvest.save(update_fields=['batch'])
            TraceabilityService.record_event(
                batch, 'HARVEST_RECORDED', request.user,
                {
                    'hive_id': harvest.hive.hive_id,
                    'quantity_kg': float(harvest.quantity_kg),
                    'harvest_date': harvest.harvest_date.isoformat(),
                },
            )
        else:
            TraceabilityService.record_harvest_only(harvest, request.user)

        return Response(HarvestSerializer(harvest).data, status=status.HTTP_201_CREATED)
