from rest_framework import serializers
from .models import HoneyBatch


class HoneyBatchSerializer(serializers.ModelSerializer):
    hive_id = serializers.CharField(source='hive.hive_id', read_only=True)
    beekeeper_name = serializers.CharField(source='beekeeper.name', read_only=True)
    apiary_name = serializers.CharField(source='beekeeper.apiary_name', read_only=True)

    class Meta:
        model = HoneyBatch
        fields = (
            'id', 'batch_id', 'hive', 'hive_id', 'beekeeper', 'beekeeper_name',
            'apiary_name', 'production_location', 'harvest_date', 'quantity_kg',
            'notes', 'processing_status', 'packaging_status', 'qr_token',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'beekeeper', 'qr_token', 'created_at', 'updated_at')


class HoneyBatchCreateSerializer(serializers.ModelSerializer):
    hive_id = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = HoneyBatch
        fields = (
            'batch_id', 'hive', 'hive_id', 'production_location',
            'harvest_date', 'quantity_kg', 'notes',
        )

    def validate_batch_id(self, value):
        if HoneyBatch.objects.filter(batch_id=value).exists():
            raise serializers.ValidationError(f'Batch ID "{value}" already exists.')
        return value

    def validate(self, attrs):
        request = self.context['request']
        hive = attrs.get('hive')
        hive_id = attrs.pop('hive_id', None)
        if not hive and hive_id:
            from hives.models import Hive
            hive = Hive.objects.filter(beekeeper=request.user, hive_id=hive_id).first()
            if not hive:
                raise serializers.ValidationError({'hive_id': 'Hive not found.'})
            attrs['hive'] = hive
        return attrs


class PublicBatchSerializer(serializers.Serializer):
    batch_id = serializers.CharField()
    beekeeper_name = serializers.CharField()
    apiary_name = serializers.CharField()
    production_location = serializers.CharField()
    hive_id = serializers.CharField()
    harvest_date = serializers.DateField()
    quantity_kg = serializers.DecimalField(max_digits=8, decimal_places=2)
    processing_status = serializers.CharField()
    packaging_status = serializers.CharField()
    timeline = serializers.ListField()
    verification = serializers.DictField()
    blockchain_transactions = serializers.ListField()
