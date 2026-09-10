from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date
from decimal import Decimal

from hives.models import Hive
from batches.models import HoneyBatch
from traceability.services import TraceabilityService, compute_event_hash

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'name': 'Test User',
            'role': 'BEEKEEPER',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        res = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'TestPass123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_me_endpoint(self):
        user = User.objects.create_user(
            email='bk@test.com', password='TestPass123!', name='BK', role=User.Role.BEEKEEPER
        )
        self.client.force_authenticate(user=user)
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'bk@test.com')


class HiveAuthorizationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bk1 = User.objects.create_user(
            email='bk1@test.com', password='TestPass123!', name='BK1', role=User.Role.BEEKEEPER
        )
        self.bk2 = User.objects.create_user(
            email='bk2@test.com', password='TestPass123!', name='BK2', role=User.Role.BEEKEEPER
        )
        self.hive = Hive.objects.create(
            beekeeper=self.bk1, hive_id='H-001', name='Test Hive',
            location='Test', installation_date=date(2025, 1, 1),
        )

    def test_beekeeper_cannot_access_other_hive(self):
        self.client.force_authenticate(user=self.bk2)
        res = self.client.get(f'/api/hives/{self.hive.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_hive(self):
        self.client.force_authenticate(user=self.bk1)
        res = self.client.post('/api/hives/', {
            'hive_id': 'H-002', 'name': 'New Hive', 'location': 'Loc',
            'installation_date': '2025-06-01', 'queen_status': 'active',
            'health_status': 'healthy', 'notes': '',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)


class TraceabilityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='bk@test.com', password='TestPass123!', name='BK',
            role=User.Role.BEEKEEPER, location='Madurai',
        )
        self.hive = Hive.objects.create(
            beekeeper=self.user, hive_id='H-001', name='Hive',
            location='Loc', installation_date=date(2025, 1, 1),
        )
        self.batch = HoneyBatch.objects.create(
            batch_id='HN001', hive=self.hive, beekeeper=self.user,
            production_location='Madurai', harvest_date=date(2026, 8, 10),
            quantity_kg=Decimal('20.0'),
        )

    def test_hash_chain_valid(self):
        TraceabilityService.record_event(
            self.batch, 'HARVEST_RECORDED', self.user,
            {'hive_id': 'H-001', 'quantity_kg': 20.0}, skip_blockchain=True,
        )
        TraceabilityService.record_event(
            self.batch, 'BATCH_CREATED', self.user,
            {'batch_id': 'HN001'}, skip_blockchain=True,
        )
        result = TraceabilityService.verify_batch(self.batch)
        self.assertTrue(result['database_chain_valid'])
        self.assertEqual(result['events_verified'], 2)

    def test_public_batch_endpoint(self):
        TraceabilityService.record_event(
            self.batch, 'BATCH_CREATED', self.user,
            {'batch_id': 'HN001'}, skip_blockchain=True,
        )
        client = APIClient()
        res = client.get('/api/public/batches/HN001/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['batch_id'], 'HN001')
        self.assertNotIn('password', str(res.data))


class BatchWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='bk@test.com', password='TestPass123!', name='BK',
            role=User.Role.BEEKEEPER, apiary_name='Farm', location='Madurai',
        )
        self.hive = Hive.objects.create(
            beekeeper=self.user, hive_id='H-001', name='Hive',
            location='Loc', installation_date=date(2025, 1, 1),
        )
        self.client.force_authenticate(user=self.user)

    def test_batch_processing_idempotency(self):
        batch = HoneyBatch.objects.create(
            batch_id='HNTEST', hive=self.hive, beekeeper=self.user,
            production_location='Madurai', harvest_date=date(2026, 8, 10),
            quantity_kg=Decimal('10.0'),
        )
        res1 = self.client.post(f'/api/batches/{batch.batch_id}/processing/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        res2 = self.client.post(f'/api/batches/{batch.batch_id}/processing/')
        self.assertEqual(res2.status_code, status.HTTP_409_CONFLICT)
