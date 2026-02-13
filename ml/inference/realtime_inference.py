import sounddevice as sd
import numpy as np
import joblib
import librosa
import os
# Load model
MODEL_PATH = os.path.join("models", "model.pkl")
model = joblib.load(MODEL_PATH)

def extract_features_from_audio(audio, sr):
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    return np.mean(mfcc.T, axis=0)

def record_audio(duration=3, sr=22050):
    print("Recording...")
    audio = sd.rec(int(duration * sr), samplerate=sr, channels=1)
    sd.wait()
    print("Done recording.")
    return audio.flatten(), sr

if __name__ == "__main__":
    audio, sr = record_audio()
    features = extract_features_from_audio(audio, sr)
    prediction = model.predict([features])
    print("Prediction:", prediction[0])
