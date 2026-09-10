"""Prototype image analysis — extensible interface for future ML models."""

import random


def analyze_hive_image(image_path):
    """
    Prototype/mock inference service.
    Replace this function with a real TensorFlow/PyTorch model when available.
    """
    return {
        'status': 'possible_issue',
        'confidence': round(random.uniform(0.55, 0.85), 2),
        'message': 'Possible abnormality detected. Please inspect the hive manually.',
        'model': 'prototype_mock',
        'disclaimer': 'Prototype mock inference — not a trained disease detection model.',
        'detected_conditions': [],
    }
