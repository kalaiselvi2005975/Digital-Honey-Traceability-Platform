import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date
from decimal import Decimal

from hives.models import Hive, HiveObservation
from harvests.models import Harvest
from batches.models import HoneyBatch
from traceability.services import TraceabilityService

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo data for SIH HoneyTrace demonstration'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        beekeeper, _ = User.objects.get_or_create(
            email='beekeeper@demo.com',
            defaults={
                'name': 'Arjun Krishnamurthy',
                'role': User.Role.BEEKEEPER,
                'apiary_name': 'Madurai Honey Farm',
                'location': 'Madurai, Tamil Nadu',
                'phone': '+91-9876543210',
            },
        )
        beekeeper.name = 'Arjun Krishnamurthy'
        beekeeper.role = User.Role.BEEKEEPER
        beekeeper.apiary_name = 'Madurai Honey Farm'
        beekeeper.location = 'Madurai, Tamil Nadu'
        beekeeper.set_password('beekeeper123')
        beekeeper.save()

        customer, _ = User.objects.get_or_create(
            email='customer@demo.com',
            defaults={
                'name': 'Priya Nair',
                'role': User.Role.CUSTOMER,
            },
        )
        customer.name = 'Priya Nair'
        customer.role = User.Role.CUSTOMER
        customer.set_password('customer123')
        customer.save()

        hive_data = [
            ('H-001', 'North Field Alpha', 'North Field, Madurai', 'healthy', 'active'),
            ('H-002', 'South Grove Beta', 'South Grove, Madurai', 'healthy', 'active'),
            ('H-003', 'East Meadow Gamma', 'East Meadow, Madurai', 'healthy', 'active'),
            ('H-004', 'West Garden Delta', 'West Garden, Madurai', 'healthy', 'active'),
            ('H-005', 'Central Orchard Epsilon', 'Central Orchard, Madurai', 'healthy', 'active'),
        ]

        hives = {}
        for hive_id, name, location, health, queen in hive_data:
            hive, _ = Hive.objects.get_or_create(
                beekeeper=beekeeper, hive_id=hive_id,
                defaults={
                    'name': name,
                    'location': location,
                    'installation_date': date(2025, 3, 15),
                    'health_status': health,
                    'queen_status': queen,
                    'notes': f'Demo hive {hive_id}',
                },
            )
            hives[hive_id] = hive

        HiveObservation.objects.get_or_create(
            hive=hives['H-001'],
            date=date(2026, 8, 24),
            defaults={
                'observation': 'Normal activity. Bees very active. Good honey stores visible.',
                'health_status': 'healthy',
                'problem_detected': False,
                'notes': 'Morning inspection.',
                'created_by': beekeeper,
            },
        )

        harvest_records = [
            ('H-001', date(2026, 8, 10), Decimal('20.0')),
            ('H-001', date(2026, 7, 25), Decimal('15.0')),
            ('H-001', date(2026, 6, 20), Decimal('14.0')),
            ('H-001', date(2026, 5, 15), Decimal('12.5')),
            ('H-002', date(2026, 8, 20), Decimal('22.0')),
            ('H-002', date(2026, 7, 10), Decimal('19.5')),
            ('H-003', date(2026, 8, 15), Decimal('16.5')),
            ('H-005', date(2026, 8, 10), Decimal('25.0')),
        ]

        for hive_id, hdate, qty in harvest_records:
            Harvest.objects.get_or_create(
                hive=hives[hive_id],
                harvest_date=hdate,
                quantity_kg=qty,
                beekeeper=beekeeper,
                defaults={'notes': f'Demo harvest from {hive_id}'},
            )

        for i in range(1, 11):
            batch_id = f'HN{i:03d}'
            hive_id = f'H-00{random.randint(1, 5)}'
            harvest_d = date(2026, 8, random.randint(1, 28))
            qty = Decimal(str(round(random.uniform(10.0, 30.0), 1)))

            batch, created = HoneyBatch.objects.get_or_create(
                batch_id=batch_id,
                defaults={
                    'hive': hives[hive_id],
                    'beekeeper': beekeeper,
                    'production_location': 'Madurai, Tamil Nadu',
                    'harvest_date': harvest_d,
                    'quantity_kg': qty,
                    'notes': f'Premium batch {batch_id} from {hive_id}.',
                    'processing_status': 'verified',
                    'packaging_status': 'verified' if i <= 7 else 'pending',
                },
            )

            if created and not batch.events.exists():
                h_img = f'/dataset/Honey_Harvest/{random.randint(1, 8)}.jpg'
                p_img = f'/dataset/Honey_Extraction/{random.randint(1, 7)}.jpg'
                pack_img = f'/dataset/Honey_Packaging/{random.randint(1, 6)}.jpg'
                farm_img = f'/dataset/Beekeeping_Farm/{random.randint(1, 6)}.jpg'
                insp_img = f'/dataset/Hive_Inspection/{random.randint(1, 6)}.jpg'
                health_img = f'/dataset/Healthy_HIve/{random.randint(1, 7)}.jpg'

                events = [
                    ('FARM_MONITORED', {'status': 'Optimal Environment', 'image': farm_img}),
                    ('HIVE_INSPECTED', {'hive_id': hive_id, 'status': 'Inspected', 'image': insp_img}),
                    ('HEALTH_VERIFIED', {'health': 'Healthy', 'image': health_img}),
                    ('HARVEST_RECORDED', {'hive_id': hive_id, 'quantity_kg': float(qty), 'harvest_date': harvest_d.isoformat(), 'image': h_img}),
                    ('BATCH_CREATED', {'batch_id': batch_id, 'hive_id': hive_id, 'quantity_kg': float(qty)}),
                    ('PROCESSING_VERIFIED', {'processing_status': 'verified', 'image': p_img}),
                ]
                
                if i <= 7:
                    events.append(('PACKAGING_VERIFIED', {'packaging_status': 'verified', 'image': pack_img}))
                    events.append(('QR_GENERATED', {'qr_token': batch_id}))

                for etype, data in events:
                    TraceabilityService.record_event(batch, etype, beekeeper, data, skip_blockchain=True)

        self.stdout.write(self.style.SUCCESS(
            f'Demo data seeded successfully with 10 batches.\n'
            f'  Beekeeper: beekeeper@demo.com / beekeeper123\n'
            f'  Customer:  customer@demo.com / customer123'
        ))
