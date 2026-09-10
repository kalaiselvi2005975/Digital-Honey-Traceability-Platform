from django.core.management.base import BaseCommand
from traceability.services import TraceabilityService


class Command(BaseCommand):
    help = 'Retry PENDING/FAILED blockchain submissions for traceability events'

    def handle(self, *args, **options):
        result = TraceabilityService.retry_pending_events()
        self.stdout.write(self.style.SUCCESS(
            f'Retried {result["retried"]} event(s); {result["confirmed"]} confirmed on-chain.'
        ))
