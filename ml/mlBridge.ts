/**
 * ML Bridge
 * Connects app Suspicion mode to ML confidence output
 */

export type MLResult = {
  confidence: number;
};

const CONFIDENCE_THRESHOLD = 0.8;

/**
 * Simulated ML inference
 * Replace later with real backend / native ML call
 */
export async function inferDistress(_audioUri: string): Promise<MLResult> {
  try {
    // Simulate processing delay (real ML would take ~300–800ms)
    await new Promise((res) => setTimeout(res, 500));

    // 🔥 For demo: random confidence
    const confidence = Math.random() * 0.5 + 0.5; 
    // gives 0.5 – 1.0 range

    return { confidence };

  } catch (error) {
    console.error("ML inference failed:", error);
    return { confidence: 0 };
  }
}

/**
 * Helper to decide if Tier2 should trigger
 */
export function shouldTriggerTier2(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLD;
}
