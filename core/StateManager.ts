import { Tier } from "./tiers";

class StateManager {
  private currentTier: Tier = Tier.IDLE;
  private transitioning = false;

  getTier(): Tier {
    return this.currentTier;
  }

  setTier(next: Tier) {
    // ⏳ block rapid double transitions
    if (this.transitioning) {
      console.log("⏳ Tier transition blocked:", this.currentTier, "→", next);
      return;
    }

    // 🔁 ignore no-op
    if (this.currentTier === next) return;

    // 🚫 INVALID TRANSITIONS (critical)
    if (
      (this.currentTier === Tier.SUSPICION && next !== Tier.IDLE) ||
      (this.currentTier === Tier.OFF && next === Tier.SUSPICION)
    ) {
      console.log("🚫 Invalid tier transition:", this.currentTier, "→", next);
      return;
    }

    this.transitioning = true;
    console.log("🧠 Tier change:", this.currentTier, "→", next);

    this.currentTier = next;

    // small debounce window to prevent flapping
    setTimeout(() => {
      this.transitioning = false;
    }, 300);
  }
}

export const stateManager = new StateManager();
