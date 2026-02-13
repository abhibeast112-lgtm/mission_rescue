import os
import pandas as pd
import numpy as np
from config import LABELS_PATH, PROCESSED_DIR, MODEL_PATH, TEST_SIZE, RANDOM_STATE

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from features.audio_features import extract_features

# Paths
DATA_DIR = os.path.join("ml", "data", "processed")
LABELS_PATH = os.path.join("ml", "data", "labels.csv")
MODEL_SAVE_PATH = os.path.join("ml", "models", "model.pkl")

# Load labels
labels_df = pd.read_csv(LABELS_PATH)

X = []
y = []

print("🔄 Extracting features...")

for _, row in labels_df.iterrows():
    file_path = os.path.join(DATA_DIR, row["file"])

    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path}")
        continue

    features = extract_features(file_path)
    X.append(features)
    y.append(row["label"])

X = np.array(X)
y = np.array(y)

print("✅ Feature extraction complete")
print("Shape:", X.shape)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# Save model
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
joblib.dump(model, MODEL_SAVE_PATH)

print("\n✅ Model saved at:", MODEL_SAVE_PATH)
