import { Tier } from "./tiers";

class StateManager {
  private currentTier: Tier = Tier.IDLE;

  getTier(): Tier {
    return this.currentTier;
  }

  setTier(tier: Tier) {
    if (this.currentTier !== tier) {
      console.log("🧠 Tier change:", this.currentTier, "→", tier);
      this.currentTier = tier;
    }
  }
}

export const stateManager = new StateManager();
