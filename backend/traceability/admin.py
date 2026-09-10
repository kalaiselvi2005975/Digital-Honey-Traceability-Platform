from django.contrib import admin
from .models import TraceabilityEvent


@admin.register(TraceabilityEvent)
class TraceabilityEventAdmin(admin.ModelAdmin):
    list_display = ('batch', 'event_type', 'blockchain_status', 'timestamp')
    list_filter = ('event_type', 'blockchain_status')
