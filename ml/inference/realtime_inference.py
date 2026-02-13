import numpy as np
from features.audio_features import extract_features
from inference.model_loader import load_model

# Load model once (important for performance)
model = load_model()

def infer(file_path: str) -> float:
    """
    Takes path to 2.5 sec audio file
    Returns confidence score (0–1)
    """

    # Extract MFCC features
    features = extract_features(file_path)

    # Reshape for sklearn (1 sample, N features)
    features = np.array(features).reshape(1, -1)

    # Get probability of class 1 (distress)
    confidence = model.predict_proba(features)[0][1]

    return float(confidence)
