import { useEffect, useRef } from "react";
import {
  startIdleAudioMonitor,
  stopIdleAudioMonitor,
} from "../audio/IdleAudioMonitor";
import { recordSuspicionWindow } from "../audio/SuspicionRecorder";
import { stateManager } from "../core/StateManager";
import { Tier } from "../core/tiers";

export function useEchoLocator() {
  const suspicionHandled = useRef(false);
  const handlingSuspicion = useRef(false);

  useEffect(() => {
    console.log("🧠 useEchoLocator mounted");
    startIdleAudioMonitor();

    const loop = setInterval(async () => {
      // 🔒 HARD LOCK while recording suspicion
      if (handlingSuspicion.current) return;

      const tier = stateManager.getTier();

      if (tier === Tier.SUSPICION && !suspicionHandled.current) {
        handlingSuspicion.current = true;
        suspicionHandled.current = true;

        console.log("🟡 Entered SUSPICION handler");

        // 🛑 stop idle listener BEFORE recording
        await stopIdleAudioMonitor();

        const rec = await recordSuspicionWindow(2500);

        // 🔁 return to idle state
        stateManager.setTier(Tier.IDLE);

        if (rec) {
          console.log("🎧 Suspicion audio captured");
        } else {
          console.log("❌ Recorder returned null");
        }

        // ▶️ resume passive listening
        await startIdleAudioMonitor();
        handlingSuspicion.current = false;
      }

      // 🔁 allow next suspicion trigger
      if (tier === Tier.IDLE) {
        suspicionHandled.current = false;
      }
    }, 500);

    return () => {
      clearInterval(loop);
      stopIdleAudioMonitor();
    };
  }, []);
}
