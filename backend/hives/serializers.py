from rest_framework import serializers
from .models import Hive, HiveObservation


class HiveObservationSerializer(serializers.ModelSerializer):
    hive_id = serializers.CharField(source='hive.hive_id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = HiveObservation
        fields = (
            'id', 'hive', 'hive_id', 'date', 'observation', 'health_status',
            'problem_detected', 'problem_description', 'notes',
            'created_by', 'created_by_name', 'created_at',
        )
        read_only_fields = ('id', 'created_by', 'created_at')


class HiveSerializer(serializers.ModelSerializer):
    beekeeper_name = serializers.CharField(source='beekeeper.name', read_only=True)
    last_inspection = serializers.SerializerMethodField()

    class Meta:
        model = Hive
        fields = (
            'id', 'hive_id', 'name', 'location', 'installation_date',
            'queen_status', 'health_status', 'notes', 'beekeeper',
            'beekeeper_name', 'last_inspection', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'beekeeper', 'created_at', 'updated_at')

    def get_last_inspection(self, obj):
        latest = obj.observations.order_by('-date').first()
        return latest.date.isoformat() if latest else None


class HiveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hive
        fields = (
            'hive_id', 'name', 'location', 'installation_date',
            'queen_status', 'health_status', 'notes',
        )

    def validate_hive_id(self, value):
        request = self.context.get('request')
        if request and Hive.objects.filter(beekeeper=request.user, hive_id=value).exists():
            raise serializers.ValidationError(f'Hive ID "{value}" already exists.')
        return value
