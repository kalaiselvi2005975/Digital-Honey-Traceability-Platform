from django.contrib import admin
from .models import HoneyBatch


@admin.register(HoneyBatch)
class HoneyBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_id', 'hive', 'beekeeper', 'processing_status', 'packaging_status')
    search_fields = ('batch_id', 'qr_token')
    list_filter = ('processing_status', 'packaging_status')
