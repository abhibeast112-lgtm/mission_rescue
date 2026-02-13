import librosa
import numpy as np
from ml.config import SAMPLE_RATE, DURATION, N_MFCC



# Standard settings for entire project
SAMPLE_RATE = 16000        # 16 kHz (mobile friendly)
DURATION = 2.5            # 2.5 seconds
N_MFCC = 13               # 13 MFCC coefficients

def extract_features(file_path: str) -> np.ndarray:
    """
    Extract MFCC features from an audio file.

    Steps:
    1. Load audio at 16kHz
    2. Trim or pad to 2.5 seconds
    3. Extract 13 MFCC features
    4. Return mean MFCC vector (13 values)
    """

    # Load audio (resample automatically to 16kHz)
    y, sr = librosa.load(file_path, sr=SAMPLE_RATE)

    # Ensure fixed length (2.5 sec)
    target_length = int(SAMPLE_RATE * DURATION)

    if len(y) > target_length:
        y = y[:target_length]  # Trim
    else:
        padding = target_length - len(y)
        y = np.pad(y, (0, padding))  # Pad with zeros

    # Extract MFCC features
    mfcc = librosa.feature.mfcc(
        y=y,
        sr=SAMPLE_RATE,
        n_mfcc=N_MFCC
    )

    # Take mean across time axis
    mfcc_mean = np.mean(mfcc.T, axis=0)

    return mfcc_mean
