import librosa
import numpy as np

def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=22050)

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    mfcc_mean = np.mean(mfcc.T, axis=0)

    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    zero_crossing = np.mean(librosa.feature.zero_crossing_rate(y))

    features = np.hstack([mfcc_mean, spectral_centroid, zero_crossing])

    return features
