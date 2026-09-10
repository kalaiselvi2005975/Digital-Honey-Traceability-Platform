"""Baseline production forecast using weighted moving average (prototype)."""

from decimal import Decimal


def predict_production(hive):
    harvests = list(
        hive.harvests.order_by('-harvest_date')[:10]
    )

    if not harvests:
        return {
            'hive_id': hive.hive_id,
            'predicted_kg': 0,
            'confidence': 'low',
            'based_on_harvests': 0,
            'model': 'weighted_baseline',
            'note': 'No harvest data available for this hive.',
            'disclaimer': 'Prototype baseline forecast — not a trained ML model.',
        }

    recent = harvests[:5]
    weights = list(range(len(recent), 0, -1))
    total_weight = sum(weights)
    weighted_sum = sum(
        float(h.quantity_kg) * w for h, w in zip(recent, weights)
    )
    predicted = round(weighted_sum / total_weight, 1)

    if len(harvests) >= 5:
        confidence = 'high'
    elif len(harvests) >= 3:
        confidence = 'moderate'
    else:
        confidence = 'low'

    if len(recent) >= 2:
        trend = float(recent[0].quantity_kg) - float(recent[-1].quantity_kg)
        predicted = max(0, round(predicted + trend * 0.1, 1))

    return {
        'hive_id': hive.hive_id,
        'predicted_kg': predicted,
        'confidence': confidence,
        'based_on_harvests': len(harvests),
        'model': 'weighted_baseline',
        'note': f'Based on {len(harvests)} historical harvest record(s).',
        'disclaimer': 'Prototype baseline forecast — not a trained ML model.',
    }
