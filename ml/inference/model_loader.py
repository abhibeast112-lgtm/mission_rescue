import joblib
import os
from config import MODEL_PATH

# Path to saved model
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "model.pkl"
)

def load_model():
    """
    Loads trained model from disk.
    """
    return joblib.load(MODEL_PATH)
