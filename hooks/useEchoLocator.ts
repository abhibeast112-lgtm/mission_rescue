// mission_rescue/hooks/useEchoLocator.ts
import { useEffect, useRef } from "react";
import { startIdleAudioMonitor, stopIdleAudioMonitor } from "../audio/IdleAudioMonitor";
import { recordSuspicionWindow } from "../audio/SuspicionRecorder";
import { stateManager } from "../core/StateManager";
import { Tier } from "../core/tiers";
import { AlertV1 } from "../core/types";
import { runDistressAI } from "../ml/mlBridge";

export function useEchoLocator() {
  const suspicionHandled = useRef(false);
  const handlingSuspicion = useRef(false);
  const idleRunning = useRef(false);

  const inFlight = useRef<Promise<void> | null>(null);

  // ✅ only run monitor after user explicitly starts listening once
  const armed = useRef(false);

  // ✅ anti-panic-spam: require 2 consecutive AI positives
  const distressStreak = useRef(0);
  const THRESHOLD = 0.6;
  const NEED_STREAK = 2;

  useEffect(() => {
    console.log("🧠 useEchoLocator mounted");

    const handleTier = async (tier: Tier) => {
      // ⛔ OFF = HARD STOP
      if (tier === Tier.OFF) {
        armed.current = false;
        distressStreak.current = 0;

        if (!idleRunning.current) return;

        console.log("⛔ Listening OFF");
        idleRunning.current = false;
        await stopIdleAudioMonitor();
        return;
      }

      // ✅ Arm when entering IDLE from a user action (your logic)
      if (tier === Tier.IDLE && stateManager.getTier() !== Tier.OFF) {
        armed.current = true;
      }

      if (handlingSuspicion.current) return;

      // 🟡 SUSPICION FLOW
      if (tier === Tier.SUSPICION && !suspicionHandled.current) {
        handlingSuspicion.current = true;
        suspicionHandled.current = true;

        console.log("🟡 Entered SUSPICION handler");

        // Stop idle monitor during suspicion
        if (idleRunning.current) {
          idleRunning.current = false;
          await stopIdleAudioMonitor();
        }

        const uri = await recordSuspicionWindow(2500);

        if (uri && stateManager.getTier() !== Tier.OFF) {
          try {
            console.log("🧠 Running AI distress check...");

            const { p, labels } = await runDistressAI(uri);

            console.log("🧠 AI probability:", p);
            console.log("🧠 AI top labels:", labels?.slice?.(0, 5));

            // Anti-spam streak logic
            if (p >= THRESHOLD) distressStreak.current += 1;
            else distressStreak.current = 0;

            const confirmed = distressStreak.current >= NEED_STREAK;

            if (confirmed) {
              distressStreak.current = 0; // reset after trigger

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
                confidence: p,
                tier: "CONFIRMED" as const,
              };

              await saveAlert(alert);
              await broadcastAlert(alert);

              console.log("🚨 AI CONFIRMED → ALERT SENT");
            } else {
              console.log("🟢 AI rejected distress — returning to IDLE");
            }
          } catch (e) {
            console.log("⚠️ AI processing failed", e);
          }
        }

        // Resume IDLE if not OFF
        if (stateManager.getTier() !== Tier.OFF) {
          stateManager.setTier(Tier.IDLE);
        }

        console.log(uri ? "🎧 Suspicion audio captured" : "❌ Recorder returned null");

        handlingSuspicion.current = false;
        return;
      }

      // 🔁 IDLE = resume passive listening (ONLY if armed)
      if (tier === Tier.IDLE) {
        if (!armed.current) return;
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
