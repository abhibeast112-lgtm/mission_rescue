import joblib
from sklearn.linear_model import LogisticRegression
import numpy as np

# Load processed data
X = np.load("ml/data/processed/features.npy")
y = np.load("ml/data/processed/labels.npy")

# Train final model on full dataset
model = LogisticRegression()
model.fit(X, y)

# Save model
joblib.dump(model, "ml/models/model.pkl")

print("✅ Final model exported as model.pkl")
