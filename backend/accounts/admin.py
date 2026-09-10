from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'apiary_name', 'is_active')
    search_fields = ('email', 'name', 'apiary_name')
    list_filter = ('role', 'is_active')
