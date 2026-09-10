import secrets
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from hives.models import Hive


class HoneyBatch(models.Model):
    class ProcessingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'

    class PackagingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'

    batch_id = models.CharField(max_length=50, unique=True)
    hive = models.ForeignKey(Hive, on_delete=models.PROTECT, related_name='batches')
    beekeeper = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='batches'
    )
    production_location = models.CharField(max_length=255)
    harvest_date = models.DateField()
    quantity_kg = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0.01)])
    notes = models.TextField(blank=True, default='')
    processing_status = models.CharField(
        max_length=20, choices=ProcessingStatus.choices, default=ProcessingStatus.PENDING
    )
    packaging_status = models.CharField(
        max_length=20, choices=PackagingStatus.choices, default=PackagingStatus.PENDING
    )
    qr_token = models.CharField(max_length=128, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch_id']),
            models.Index(fields=['qr_token']),
            models.Index(fields=['beekeeper']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.qr_token:
            self.qr_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.batch_id
