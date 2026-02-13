import numpy as np
import joblib
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

# Load processed features
X = np.load("ml/data/processed/features.npy")
y = np.load("ml/data/processed/labels.npy")

# Load trained model
model = joblib.load("ml/models/model.pkl")

# Split again for evaluation
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

y_pred = model.predict(X_test)

print("=== Classification Report ===")
print(classification_report(y_test, y_pred))

print("=== Confusion Matrix ===")
print(confusion_matrix(y_test, y_pred))
