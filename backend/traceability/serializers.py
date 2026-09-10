from rest_framework import serializers
from .models import TraceabilityEvent


class TraceabilityEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.name', read_only=True, allow_null=True)

    class Meta:
        model = TraceabilityEvent
        fields = (
            'id', 'batch', 'event_type', 'actor', 'actor_name', 'timestamp',
            'event_data', 'previous_hash', 'event_hash',
            'blockchain_tx_hash', 'blockchain_network', 'blockchain_status',
            'created_at',
        )
