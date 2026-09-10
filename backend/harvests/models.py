from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from hives.models import Hive


class Harvest(models.Model):
    harvest_id = models.CharField(max_length=50, unique=True, blank=True)
    hive = models.ForeignKey(Hive, on_delete=models.CASCADE, related_name='harvests')
    harvest_date = models.DateField()
    quantity_kg = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0.01)])
    batch = models.ForeignKey(
        'batches.HoneyBatch', on_delete=models.SET_NULL, null=True, blank=True, related_name='harvests'
    )
    notes = models.TextField(blank=True, default='')
    beekeeper = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='harvests'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-harvest_date', '-created_at']
        indexes = [
            models.Index(fields=['beekeeper']),
            models.Index(fields=['hive']),
            models.Index(fields=['harvest_date']),
        ]

    def save(self, *args, **kwargs):
        if not self.harvest_id:
            import uuid
            self.harvest_id = f'HV-{uuid.uuid4().hex[:12].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.harvest_id} — {self.quantity_kg}kg'
