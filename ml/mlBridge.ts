// mission_rescue/ml/mlBridge.ts
import { classifyAudioHF } from "./hfAudioClassify";
import { distressProbability } from "./distressScore";

export async function runDistressAI(fileUri: string) {
  const labels = await classifyAudioHF(fileUri);
  const p = distressProbability(labels);
  return { p, labels };
}
