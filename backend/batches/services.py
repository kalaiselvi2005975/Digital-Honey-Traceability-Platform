from django.conf import settings
from .models import HoneyBatch
from traceability.services import TraceabilityService


class BatchService:
    @staticmethod
    def create_from_harvest(harvest, batch_id, user):
        beekeeper = harvest.beekeeper
        location = beekeeper.location or 'Unknown'
        batch, created = HoneyBatch.objects.get_or_create(
            batch_id=batch_id,
            defaults={
                'hive': harvest.hive,
                'beekeeper': beekeeper,
                'production_location': location,
                'harvest_date': harvest.harvest_date,
                'quantity_kg': harvest.quantity_kg,
                'notes': harvest.notes,
            },
        )
        if created:
            TraceabilityService.record_event(
                batch, 'BATCH_CREATED', user,
                {
                    'batch_id': batch.batch_id,
                    'hive_id': batch.hive.hive_id,
                    'quantity_kg': float(batch.quantity_kg),
                    'harvest_date': batch.harvest_date.isoformat(),
                },
            )
        return batch, created

    @staticmethod
    def create_batch(data, user):
        from hives.models import Hive
        hive = Hive.objects.get(id=data['hive'], beekeeper=user)
        batch = HoneyBatch.objects.create(
            batch_id=data['batch_id'],
            hive=hive,
            beekeeper=user,
            production_location=data.get('production_location', user.location or ''),
            harvest_date=data['harvest_date'],
            quantity_kg=data['quantity_kg'],
            notes=data.get('notes', ''),
        )
        TraceabilityService.record_event(
            batch, 'BATCH_CREATED', user,
            {
                'batch_id': batch.batch_id,
                'hive_id': hive.hive_id,
                'quantity_kg': float(batch.quantity_kg),
            },
        )
        return batch

    @staticmethod
    def verify_processing(batch, user):
        if batch.processing_status == HoneyBatch.ProcessingStatus.VERIFIED:
            return batch, False
        batch.processing_status = HoneyBatch.ProcessingStatus.VERIFIED
        batch.save(update_fields=['processing_status', 'updated_at'])
        TraceabilityService.record_event(
            batch, 'PROCESSING_VERIFIED', user, {'processing_status': 'verified'},
        )
        return batch, True

    @staticmethod
    def verify_packaging(batch, user):
        if batch.packaging_status == HoneyBatch.PackagingStatus.VERIFIED:
            return batch, False
        batch.packaging_status = HoneyBatch.PackagingStatus.VERIFIED
        batch.save(update_fields=['packaging_status', 'updated_at'])
        TraceabilityService.record_event(
            batch, 'PACKAGING_VERIFIED', user, {'packaging_status': 'verified'},
        )
        return batch, True

    @staticmethod
    def generate_qr(batch, user):
        if not batch.qr_token:
            import secrets
            batch.qr_token = secrets.token_urlsafe(32)
            batch.save(update_fields=['qr_token', 'updated_at'])
        existing = batch.events.filter(event_type='QR_GENERATED').exists()
        if not existing:
            TraceabilityService.record_event(
                batch, 'QR_GENERATED', user, {'qr_token': batch.batch_id},
            )
        return batch
