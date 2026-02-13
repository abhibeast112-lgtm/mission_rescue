from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import os
import joblib
import numpy as np
import librosa

app = FastAPI()
@app.get("/")
def root():
    return {"message": "ML backend running"}
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("favicon.ico")

# Safe absolute path
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.pkl")

model = joblib.load(MODEL_PATH)

def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=None)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    return np.mean(mfcc.T, axis=0)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    temp_path = os.path.join(BASE_DIR, "temp.wav")

    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    features = extract_features(temp_path)
    prediction = model.predict([features])

    return {"prediction": int(prediction[0])}
