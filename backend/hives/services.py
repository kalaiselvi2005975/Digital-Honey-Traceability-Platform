from datetime import date
from .models import Hive


STARTER_HIVES = [
    ('H-001', 'North Field Alpha', 'North Field, Madurai', 'healthy', 'active'),
    ('H-002', 'South Grove Beta', 'South Grove, Madurai', 'healthy', 'active'),
    ('H-003', 'East Meadow Gamma', 'East Meadow, Madurai', 'healthy', 'active'),
    ('H-004', 'West Garden Delta', 'West Garden, Madurai', 'healthy', 'active'),
    ('H-005', 'Central Orchard Epsilon', 'Central Orchard, Madurai', 'healthy', 'active'),
]


def ensure_starter_hives(user):
    """Create demo hives so new beekeepers can record harvests immediately."""
    if not getattr(user, 'is_beekeeper', False) and not getattr(user, 'is_admin_user', False):
        return 0
    if Hive.objects.filter(beekeeper=user).exists():
        return 0
    location = user.location or 'Madurai, Tamil Nadu'
    created = 0
    for hive_id, name, loc, health, queen in STARTER_HIVES:
        Hive.objects.create(
            beekeeper=user,
            hive_id=hive_id,
            name=name,
            location=loc if location == 'Madurai, Tamil Nadu' else location,
            installation_date=date(2025, 3, 15),
            queen_status=queen,
            health_status=health,
            notes='Starter hive created so harvest recording can begin.',
        )
        created += 1
    return created
