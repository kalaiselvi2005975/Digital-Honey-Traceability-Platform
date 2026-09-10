from django.contrib import admin
from .models import Hive, HiveObservation


class HiveObservationInline(admin.TabularInline):
    model = HiveObservation
    extra = 0


@admin.register(Hive)
class HiveAdmin(admin.ModelAdmin):
    list_display = ('hive_id', 'name', 'beekeeper', 'health_status', 'queen_status')
    list_filter = ('health_status', 'queen_status')
    search_fields = ('hive_id', 'name')
    inlines = [HiveObservationInline]


@admin.register(HiveObservation)
class HiveObservationAdmin(admin.ModelAdmin):
    list_display = ('hive', 'date', 'health_status', 'problem_detected')
