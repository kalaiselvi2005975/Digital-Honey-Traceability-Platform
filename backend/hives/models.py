from django.db import models
from django.conf import settings


class Hive(models.Model):
    class HealthStatus(models.TextChoices):
        HEALTHY = 'healthy', 'Healthy'
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'

    class QueenStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        WEAK = 'weak', 'Weak'
        UNKNOWN = 'unknown', 'Unknown'

    hive_id = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    installation_date = models.DateField()
    queen_status = models.CharField(
        max_length=20, choices=QueenStatus.choices, default=QueenStatus.ACTIVE
    )
    health_status = models.CharField(
        max_length=20, choices=HealthStatus.choices, default=HealthStatus.HEALTHY
    )
    notes = models.TextField(blank=True, default='')
    beekeeper = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hives'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('beekeeper', 'hive_id')]
        indexes = [
            models.Index(fields=['hive_id']),
            models.Index(fields=['beekeeper']),
            models.Index(fields=['health_status']),
        ]
        ordering = ['hive_id']

    def __str__(self):
        return f'{self.hive_id} — {self.name}'


class HiveObservation(models.Model):
    hive = models.ForeignKey(Hive, on_delete=models.CASCADE, related_name='observations')
    date = models.DateField()
    observation = models.TextField()
    health_status = models.CharField(
        max_length=20, choices=Hive.HealthStatus.choices, default=Hive.HealthStatus.HEALTHY
    )
    problem_detected = models.BooleanField(default=False)
    problem_description = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='observations'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['hive', 'date']),
        ]

    def __str__(self):
        return f'{self.hive.hive_id} observation on {self.date}'
