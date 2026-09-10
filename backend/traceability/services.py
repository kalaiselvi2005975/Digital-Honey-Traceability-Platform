import hashlib
import json
from django.utils import timezone

from .models import TraceabilityEvent


def canonical_json(data):
    return json.dumps(data, sort_keys=True, separators=(',', ':'))


def compute_event_hash(previous_hash, batch_id, timestamp, event_type, actor_id, event_data):
    payload = '|'.join([
        previous_hash,
        batch_id,
        timestamp if isinstance(timestamp, str) else timestamp.isoformat(),
        event_type,
        str(actor_id or ''),
        canonical_json(event_data),
    ])
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()


class TraceabilityService:
    @staticmethod
    def get_previous_hash(batch):
        last = batch.events.order_by('-timestamp', '-id').first()
        return last.event_hash if last else 'GENESIS'

    @staticmethod
    def record_event(batch, event_type, actor, event_data, skip_blockchain=False):
        existing = batch.events.filter(event_type=event_type).first()
        if existing and event_type in (
            TraceabilityEvent.EventType.PROCESSING_VERIFIED,
            TraceabilityEvent.EventType.PACKAGING_VERIFIED,
            TraceabilityEvent.EventType.QR_GENERATED,
        ):
            return existing

        previous_hash = TraceabilityService.get_previous_hash(batch)
        ts = timezone.now()
        actor_id = actor.id if actor else None
        event_hash = compute_event_hash(
            previous_hash, batch.batch_id, ts, event_type, actor_id, event_data
        )

        event = TraceabilityEvent.objects.create(
            batch=batch,
            event_type=event_type,
            actor=actor,
            timestamp=ts,
            event_data=event_data,
            previous_hash=previous_hash,
            event_hash=event_hash,
            blockchain_status=TraceabilityEvent.BlockchainStatus.PENDING,
        )

        if not skip_blockchain:
            TraceabilityService._submit_to_blockchain(event)

        return event

    @staticmethod
    def record_harvest_only(harvest, actor):
        if harvest.batch:
            return TraceabilityService.record_event(
                harvest.batch, 'HARVEST_RECORDED', actor,
                {
                    'hive_id': harvest.hive.hive_id,
                    'quantity_kg': float(harvest.quantity_kg),
                    'harvest_date': harvest.harvest_date.isoformat(),
                },
            )
        return None

    @staticmethod
    def _submit_to_blockchain(event):
        try:
            from blockchain.service import BlockchainService
            result = BlockchainService.record_event(
                event.batch.batch_id, event.event_type, event.event_hash
            )
            if result.get('success'):
                event.blockchain_tx_hash = result.get('tx_hash', '')
                event.blockchain_network = result.get('network', '')
                event.blockchain_status = TraceabilityEvent.BlockchainStatus.CONFIRMED
            else:
                event.blockchain_status = TraceabilityEvent.BlockchainStatus.FAILED
            event.save(update_fields=[
                'blockchain_tx_hash', 'blockchain_network', 'blockchain_status'
            ])
        except Exception:
            event.blockchain_status = TraceabilityEvent.BlockchainStatus.FAILED
            event.save(update_fields=['blockchain_status'])

    @staticmethod
    def retry_pending_events(batch=None):
        qs = TraceabilityEvent.objects.filter(
            blockchain_status__in=[
                TraceabilityEvent.BlockchainStatus.PENDING,
                TraceabilityEvent.BlockchainStatus.FAILED,
            ]
        )
        if batch:
            qs = qs.filter(batch=batch)
        retried = 0
        confirmed = 0
        for event in qs.select_related('batch'):
            retried += 1
            TraceabilityService._submit_to_blockchain(event)
            event.refresh_from_db()
            if event.blockchain_status == TraceabilityEvent.BlockchainStatus.CONFIRMED:
                confirmed += 1
        return {'retried': retried, 'confirmed': confirmed}

    @staticmethod
    def verify_batch(batch):
        events = list(batch.events.order_by('timestamp', 'id'))
        if not events:
            return {
                'valid': True,
                'batch_id': batch.batch_id,
                'database_chain_valid': True,
                'blockchain_valid': True,
                'events_verified': 0,
                'blockchain_status': 'no_events',
            }

        prev_hash = 'GENESIS'
        failed_at = None
        db_valid = True

        for event in events:
            if event.previous_hash != prev_hash:
                db_valid = False
                failed_at = event.event_type
                break
            expected = compute_event_hash(
                event.previous_hash,
                batch.batch_id,
                event.timestamp,
                event.event_type,
                event.actor_id,
                event.event_data,
            )
            if expected != event.event_hash:
                db_valid = False
                failed_at = event.event_type
                break
            prev_hash = event.event_hash

        blockchain_valid = True
        blockchain_pending = False
        blockchain_failed = False

        from blockchain.service import BlockchainService
        for event in events:
            if event.blockchain_status == TraceabilityEvent.BlockchainStatus.PENDING:
                blockchain_pending = True
                blockchain_valid = False
            elif event.blockchain_status == TraceabilityEvent.BlockchainStatus.FAILED:
                blockchain_failed = True
                blockchain_valid = False
            elif event.blockchain_tx_hash:
                verified = BlockchainService.verify_event(
                    batch.batch_id, event.event_type, event.event_hash, event.blockchain_tx_hash
                )
                if not verified:
                    blockchain_valid = False
                    failed_at = failed_at or event.event_type

        overall_valid = db_valid and blockchain_valid and not blockchain_pending

        status_label = 'verified'
        if blockchain_pending:
            status_label = 'pending'
        elif blockchain_failed or not db_valid or not blockchain_valid:
            status_label = 'failed'

        result = {
            'valid': overall_valid,
            'batch_id': batch.batch_id,
            'database_chain_valid': db_valid,
            'blockchain_valid': blockchain_valid,
            'events_verified': len(events),
            'blockchain_status': status_label,
        }
        if failed_at:
            result['failed_at'] = failed_at
        return result
