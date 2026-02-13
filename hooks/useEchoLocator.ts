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
  const idleRunning = useRef(false);

  useEffect(() => {
    console.log("🧠 useEchoLocator mounted");

    const unsubscribe = stateManager.subscribe(async (tier) => {

      // ⛔ OFF = HARD STOP
      if (tier === Tier.OFF) {
        console.log("⛔ Listening OFF");
        idleRunning.current = false;
        await stopIdleAudioMonitor();
        return;
      }

      // 🔒 Block re-entry during suspicion handling
      if (handlingSuspicion.current) return;

      // 🟡 SUSPICION FLOW
      if (tier === Tier.SUSPICION && !suspicionHandled.current) {
        handlingSuspicion.current = true;
        suspicionHandled.current = true;

        console.log("🟡 Entered SUSPICION handler");

        idleRunning.current = false;
        await stopIdleAudioMonitor();

        const rec = await recordSuspicionWindow(2500);

        stateManager.setTier(Tier.IDLE);

        if (rec) {
          console.log("🎧 Suspicion audio captured");
        } else {
          console.log("❌ Recorder returned null");
        }

        handlingSuspicion.current = false;
      }

      // 🔁 IDLE = resume passive listening (once)
      if (tier === Tier.IDLE && !idleRunning.current) {
        suspicionHandled.current = false;
        idleRunning.current = true;
        await startIdleAudioMonitor();
      }
    });

    return () => {
      unsubscribe();
      stopIdleAudioMonitor();
    };
  }, []);
}
