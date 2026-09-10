from rest_framework import serializers
from .models import Harvest


class HarvestSerializer(serializers.ModelSerializer):
    hive_id = serializers.CharField(source='hive.hive_id', read_only=True)
    batch_id = serializers.CharField(source='batch.batch_id', read_only=True, allow_null=True)

    class Meta:
        model = Harvest
        fields = (
            'id', 'harvest_id', 'hive', 'hive_id', 'harvest_date', 'quantity_kg',
            'batch', 'batch_id', 'notes', 'beekeeper', 'created_at',
        )
        read_only_fields = ('id', 'harvest_id', 'beekeeper', 'created_at')


class HarvestCreateSerializer(serializers.ModelSerializer):
    hive_id = serializers.CharField(write_only=True, required=False)
    batch_id = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Harvest
        fields = ('hive', 'hive_id', 'harvest_date', 'quantity_kg', 'batch_id', 'notes')

    def validate_quantity_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quantity must be greater than 0.')
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
        if hive and hive.beekeeper_id != request.user.id and not request.user.is_admin_user:
            raise serializers.ValidationError({'hive': 'You do not own this hive.'})
        return attrs
