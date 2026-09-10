from django.contrib import admin
from .models import Harvest


@admin.register(Harvest)
class HarvestAdmin(admin.ModelAdmin):
    list_display = ('harvest_id', 'hive', 'harvest_date', 'quantity_kg', 'beekeeper')
    list_filter = ('harvest_date',)
