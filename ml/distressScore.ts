// mission_rescue/ml/distressScore.ts
import type { HFLabel } from "./hfAudioClassify";

const DISTRESS_KEYWORDS = [
  "scream",
  "cry",
  "yell",
  "shout",
  "alarm",
  "siren",
  "distress",
];

export function distressProbability(labels: HFLabel[]): number {
  let best = 0;
  for (const item of labels) {
    const name = (item.label || "").toLowerCase();
    if (DISTRESS_KEYWORDS.some((k) => name.includes(k))) {
      best = Math.max(best, item.score || 0);
    }
  }
  return best;
}
