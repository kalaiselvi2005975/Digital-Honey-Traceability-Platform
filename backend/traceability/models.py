from django.db import models
from django.conf import settings
from django.utils import timezone


class TraceabilityEvent(models.Model):
    class EventType(models.TextChoices):
        HARVEST_RECORDED = 'HARVEST_RECORDED', 'Harvest Recorded'
        BATCH_CREATED = 'BATCH_CREATED', 'Batch Created'
        PROCESSING_VERIFIED = 'PROCESSING_VERIFIED', 'Processing Verified'
        PACKAGING_VERIFIED = 'PACKAGING_VERIFIED', 'Packaging Verified'
        QR_GENERATED = 'QR_GENERATED', 'QR Generated'
        BATCH_UPDATED = 'BATCH_UPDATED', 'Batch Updated'

    class BlockchainStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        FAILED = 'FAILED', 'Failed'

    batch = models.ForeignKey(
        'batches.HoneyBatch', on_delete=models.CASCADE, related_name='events'
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    timestamp = models.DateTimeField(default=timezone.now)
    event_data = models.JSONField(default=dict)
    previous_hash = models.CharField(max_length=128, default='GENESIS')
    event_hash = models.CharField(max_length=128)
    blockchain_tx_hash = models.CharField(max_length=128, blank=True, default='')
    blockchain_network = models.CharField(max_length=64, blank=True, default='')
    blockchain_status = models.CharField(
        max_length=20, choices=BlockchainStatus.choices, default=BlockchainStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp', 'id']
        indexes = [
            models.Index(fields=['batch', 'event_type']),
            models.Index(fields=['event_hash']),
            models.Index(fields=['blockchain_tx_hash']),
        ]

    def __str__(self):
        return f'{self.batch.batch_id} — {self.event_type}'
