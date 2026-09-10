"""Baseline rule-based hive health prediction (prototype — not a trained ML model)."""


def predict_hive_health(hive):
    observations = list(hive.observations.order_by('-date')[:5])
    queen = hive.queen_status

    score = 0.0
    reasons = []

    if hive.health_status == 'critical':
        score += 0.5
        reasons.append('Hive marked as critical.')
    elif hive.health_status == 'warning':
        score += 0.3
        reasons.append('Hive marked as warning.')

    if queen == 'weak':
        score += 0.25
        reasons.append('Queen status is weak.')
    elif queen == 'unknown':
        score += 0.15
        reasons.append('Queen status unknown.')

    critical_obs = sum(1 for o in observations if o.health_status == 'critical')
    warning_obs = sum(1 for o in observations if o.health_status == 'warning')
    problem_obs = sum(1 for o in observations if o.problem_detected)

    if critical_obs >= 1:
        score += 0.3
        reasons.append(f'{critical_obs} recent critical observation(s).')
    if warning_obs >= 2:
        score += 0.2
        reasons.append(f'{warning_obs} recent warning observations.')
    if problem_obs >= 2:
        score += 0.15
        reasons.append('Multiple problems detected in recent inspections.')

    score = min(score, 1.0)

    if score >= 0.6:
        status = 'critical'
    elif score >= 0.3:
        status = 'warning'
    else:
        status = 'healthy'

    if not reasons:
        reasons.append('No significant issues detected in baseline analysis.')

    return {
        'status': status,
        'confidence': round(0.5 + score * 0.4, 2),
        'reason': ' '.join(reasons),
        'model': 'rule_based_baseline',
        'disclaimer': 'Prototype baseline prediction — not a trained ML model.',
    }
