import sys
import os

# Ensure project root is in path (prevents import issues)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from inference.realtime_inference import infer
from config import CONFIDENCE_THRESHOLD
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ML server running"}



def main():
    print("🚀 EchoLocator ML Inference")

    # Ask user for audio file path
    file_path = input("Enter path to 2.5 sec audio file: ").strip()

    if not os.path.exists(file_path):
        print("❌ File not found.")
        return

    try:
        confidence = infer(file_path)

        print(f"\n🎯 Confidence Score: {confidence:.4f}")

        if confidence >= CONFIDENCE_THRESHOLD:
            print("🔴 Distress Detected (Tier 2 Trigger)")
        else:
            print("🟢 Normal Audio")

    except Exception as e:
        print("❌ Error during inference:", e)


if __name__ == "__main__":
    main()
