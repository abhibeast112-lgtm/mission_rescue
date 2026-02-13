import os

# ===== Base Paths =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
LABELS_PATH = os.path.join(DATA_DIR, "labels.csv")

MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "model.pkl")

# ===== Audio Settings =====
SAMPLE_RATE = 16000
DURATION = 2.5           # seconds
N_MFCC = 13

# ===== ML Settings =====
TEST_SIZE = 0.2
RANDOM_STATE = 42
CONFIDENCE_THRESHOLD = 0.8
