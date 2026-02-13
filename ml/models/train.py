import os
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from features.audio_features import extract_features

# Path to raw dataset
DATA_PATH = os.path.join("data", "raw")

# Label mapping
label_map = {
    "normal": 0,
    "distress": 1
}

X = []
y = []

# Load dataset
for label_name in label_map:
    folder_path = os.path.join(DATA_PATH, label_name)

    if not os.path.exists(folder_path):
        print(f"Folder not found: {folder_path}")
        continue

    for file in os.listdir(folder_path):
        if file.endswith(".wav"):
            file_path = os.path.join(folder_path, file)
            features = extract_features(file_path)
            X.append(features)
            y.append(label_map[label_name])

# Convert to numpy
X = np.array(X)
y = np.array(y)

if len(X) == 0:
    print("❌ No training data found.")
    exit()

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# Save model
model_path = os.path.join("models", "model.pkl")
joblib.dump(model, model_path)

print(f"\n✅ Model saved at {model_path}")
