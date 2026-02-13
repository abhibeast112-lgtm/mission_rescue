import { Tier } from "./tiers";

type TierListener = (tier: Tier) => void;

class StateManager {
  private currentTier: Tier = Tier.IDLE;
  private listeners = new Set<TierListener>();

  getTier(): Tier {
    return this.currentTier;
  }

  setTier(tier: Tier) {
    if (this.currentTier !== tier) {
      console.log("🧠 Tier change:", this.currentTier, "→", tier);
      this.currentTier = tier;

      // 🔔 notify listeners
      this.listeners.forEach((listener) => listener(tier));
    }
  }

  subscribe(listener: TierListener) {
    this.listeners.add(listener);

    // return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const stateManager = new StateManager();
