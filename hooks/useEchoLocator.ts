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
    const unsubscribe = stateManager.subscribe(async (tier) => {
  if (handlingSuspicion.current) return;

  if (tier === Tier.SUSPICION && !suspicionHandled.current) {
    handlingSuspicion.current = true;
    suspicionHandled.current = true;

    console.log("🟡 Entered SUSPICION handler");

    await stopIdleAudioMonitor();
    const rec = await recordSuspicionWindow(2500);

    stateManager.setTier(Tier.IDLE);

    if (rec) {
      console.log("🎧 Suspicion audio captured");
    } else {
      console.log("❌ Recorder returned null");
    }

    await startIdleAudioMonitor();
    handlingSuspicion.current = false;
  }

  if (tier === Tier.IDLE) {
    suspicionHandled.current = false;
  }
});


    return () => {
        unsubscribe();
      stopIdleAudioMonitor();
    };
  }, []);
}
