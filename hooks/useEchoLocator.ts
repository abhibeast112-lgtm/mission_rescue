import { useEffect, useRef } from "react";
import { startIdleAudioMonitor, stopIdleAudioMonitor } from "../audio/IdleAudioMonitor";
import { recordSuspicionWindow } from "../audio/SuspicionRecorder";
import { stateManager } from "../core/StateManager";
import { Tier } from "../core/tiers";
import { AlertV1 } from "../core/types";


export function useEchoLocator() {
  const suspicionHandled = useRef(false);
  const handlingSuspicion = useRef(false);
  const idleRunning = useRef(false);

  const inFlight = useRef<Promise<void> | null>(null);

  // ✅ NEW: only run monitor after user explicitly starts listening once
  const armed = useRef(false);

  useEffect(() => {
    console.log("🧠 useEchoLocator mounted");

    const handleTier = async (tier: Tier) => {
      // ⛔ OFF = HARD STOP
      if (tier === Tier.OFF) {
        armed.current = false; // ✅ user disarmed
        if (!idleRunning.current) return;
        console.log("⛔ Listening OFF");
        idleRunning.current = false;
        await stopIdleAudioMonitor();
        return;
      }

      // ✅ user explicitly started listening (IDLE entered from OFF)
      if (tier === Tier.IDLE && stateManager.getTier() !== Tier.OFF) {
        // if you want: armed when IDLE is set by button
        // easiest: arm as soon as tier is IDLE
        armed.current = true;
      }

      if (handlingSuspicion.current) return;

      // 🟡 SUSPICION FLOW
      if (tier === Tier.SUSPICION && !suspicionHandled.current) {
        handlingSuspicion.current = true;
        suspicionHandled.current = true;

        console.log("🟡 Entered SUSPICION handler");

        if (idleRunning.current) {
          idleRunning.current = false;
          await stopIdleAudioMonitor();
        }

        const rec = await recordSuspicionWindow(2500);
        if (rec && stateManager.getTier() !== Tier.OFF) {
  try {
    const { getDeviceId } = await import("../core/deviceId");
    const { saveAlert } = await import("../storage/alertsStore");
    const { broadcastAlert } = await import("../mesh/transport");

    const senderId = await getDeviceId();

   const alert: AlertV1 = {
  v: 1 as const,
  id: "a_" + Date.now().toString(36),
  createdAt: Date.now(),
  senderId,
  hop: 0,
  ttl: 6,
  confidence: 0.85,
  tier: "CONFIRMED" as const,
};


    await saveAlert(alert);
    await broadcastAlert(alert);

    console.log("🚨 AUTO ALERT SENT");
  } catch (e) {
    console.log("⚠️ alert build failed", e);
  }
}


        if (stateManager.getTier() !== Tier.OFF) {
          stateManager.setTier(Tier.IDLE);
        }

        console.log(rec ? "🎧 Suspicion audio captured" : "❌ Recorder returned null");
        handlingSuspicion.current = false;
        return;
      }

      // 🔁 IDLE = resume passive listening (ONLY if armed)
      if (tier === Tier.IDLE) {
        if (!armed.current) return;          // ✅ this is the key
        if (idleRunning.current) return;

        suspicionHandled.current = false;
        idleRunning.current = true;
        await startIdleAudioMonitor();
        return;
      }
    };

    const unsubscribe = stateManager.subscribe((tier) => {
      inFlight.current = (inFlight.current ?? Promise.resolve())
        .then(() => handleTier(tier))
        .catch(() => {});
    });

    return () => {
      unsubscribe();
      stopIdleAudioMonitor();
    };
  }, []);
}
