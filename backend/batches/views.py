from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import HoneyBatch
from .serializers import HoneyBatchSerializer, HoneyBatchCreateSerializer, PublicBatchSerializer
from .services import BatchService
from hives.permissions import IsBeekeeperOrAdmin
from traceability.services import TraceabilityService
from traceability.serializers import TraceabilityEventSerializer


class BatchViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsBeekeeperOrAdmin]
    pagination_class = None
    lookup_field = 'batch_id'
    lookup_url_kwarg = 'batch_id'

    def get_queryset(self):
        user = self.request.user
        qs = HoneyBatch.objects.select_related('hive', 'beekeeper')
        if user.is_admin_user:
            return qs.all()
        return qs.filter(beekeeper=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return HoneyBatchCreateSerializer
        return HoneyBatchSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        batch = BatchService.create_batch(serializer.validated_data, request.user)
        return Response(HoneyBatchSerializer(batch).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='processing')
    def processing(self, request, batch_id=None):
        batch = self.get_object()
        batch, created = BatchService.verify_processing(batch, request.user)
        if not created:
            return Response({'detail': 'Processing already verified.'}, status=status.HTTP_409_CONFLICT)
        return Response(HoneyBatchSerializer(batch).data)

    @action(detail=True, methods=['post'], url_path='packaging')
    def packaging(self, request, batch_id=None):
        batch = self.get_object()
        batch, created = BatchService.verify_packaging(batch, request.user)
        if not created:
            return Response({'detail': 'Packaging already verified.'}, status=status.HTTP_409_CONFLICT)
        return Response(HoneyBatchSerializer(batch).data)

    @action(detail=True, methods=['post'], url_path='qr')
    def qr(self, request, batch_id=None):
        batch = self.get_object()
        batch = BatchService.generate_qr(batch, request.user)
        from django.conf import settings
        public_url = f'{settings.FRONTEND_URL}/batch/{batch.batch_id}'
        return Response({
            'batch': HoneyBatchSerializer(batch).data,
            'public_url': public_url,
        })

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, batch_id=None):
        batch = self.get_object()
        events = batch.events.select_related('actor').order_by('timestamp')
        return Response(TraceabilityEventSerializer(events, many=True).data)

    @action(detail=True, methods=['get'], url_path='verify')
    def verify(self, request, batch_id=None):
        batch = self.get_object()
        result = TraceabilityService.verify_batch(batch)
        return Response(result)

    @action(detail=True, methods=['post'], url_path='blockchain-retry')
    def blockchain_retry(self, request, batch_id=None):
        batch = self.get_object()
        result = TraceabilityService.retry_pending_events(batch)
        verification = TraceabilityService.verify_batch(batch)
        return Response({**result, 'verification': verification})


class PublicBatchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, batch_id):
        batch = get_object_or_404(
            HoneyBatch.objects.select_related('hive', 'beekeeper'), batch_id=batch_id
        )
        verification = TraceabilityService.verify_batch(batch)
        events = batch.events.order_by('timestamp')
        timeline = [
            {
                'event_type': e.event_type,
                'timestamp': e.timestamp.isoformat(),
                'blockchain_status': e.blockchain_status,
                'blockchain_tx_hash': e.blockchain_tx_hash or None,
                'event_hash': e.event_hash,
                'event_data': e.event_data,
            }
            for e in events
        ]
        data = {
            'batch_id': batch.batch_id,
            'beekeeper_name': batch.beekeeper.name,
            'apiary_name': batch.beekeeper.apiary_name or batch.beekeeper.name,
            'production_location': batch.production_location,
            'hive_id': batch.hive.hive_id,
            'harvest_date': batch.harvest_date,
            'quantity_kg': batch.quantity_kg,
            'processing_status': batch.processing_status,
            'packaging_status': batch.packaging_status,
            'timeline': timeline,
            'verification': verification,
            'blockchain_transactions': [
                {
                    'event_type': e.event_type,
                    'tx_hash': e.blockchain_tx_hash,
                    'network': e.blockchain_network,
                    'status': e.blockchain_status,
                }
                for e in events if e.blockchain_tx_hash
            ],
        }
        return Response(data)
