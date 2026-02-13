import { Tier } from "./tiers";

type TierListener = (tier: Tier) => void;

const SUSPICION_GLOBAL_COOLDOWN = 15_000; // 15 seconds

class StateManager {
  private currentTier: Tier = Tier.OFF;

  private listeners = new Set<TierListener>();
  private lastSuspicionTime = 0;

  getTier(): Tier {
    return this.currentTier;
  }

  canTriggerSuspicion(): boolean {
    return Date.now() - this.lastSuspicionTime > SUSPICION_GLOBAL_COOLDOWN;
  }

setTier(tier: Tier) {
  if (tier === Tier.OFF) {
    console.log("🧨 OFF requested from:\n" + new Error().stack);
  }

  // 🚫 global cooldown check
  if (tier === Tier.SUSPICION && !this.canTriggerSuspicion()) {
    console.log("⏳ Suspicion blocked (global cooldown)");
    return;
  }

  if (this.currentTier !== tier) {
    console.log("🧠 Tier change:", this.currentTier, "→", tier);
    this.currentTier = tier;

    if (tier === Tier.SUSPICION) {
      this.lastSuspicionTime = Date.now();
    }

    this.listeners.forEach((listener) => listener(tier));
  }
}


subscribe(listener: TierListener) {
  this.listeners.add(listener);
  return () => {
    this.listeners.delete(listener); // ✅ no boolean returned
  };
}

}
export const stateManager = new StateManager();
