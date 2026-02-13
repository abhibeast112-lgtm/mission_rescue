let ownsAudioLock = false;
import { Audio } from "expo-av";
import { stateManager } from "../core/StateManager";
import { Tier } from "../core/tiers";
import {
  AUDIO_RMS_THRESHOLD,
  IDLE_SAMPLE_INTERVAL,
  SUSPICION_COOLDOWN_MS,
} from "../core/constants";
import { isAudioBusy, lockAudio, unlockAudio } from "./AudioLock";

let recording: Audio.Recording | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let lastTrigger = 0;

export async function startIdleAudioMonitor() {
    if (recording || intervalId) {
  console.log("⚠️ Idle monitor already running");
  return;
}

  if (isAudioBusy()) {
    console.log("🔒 Audio busy, idle monitor not started");
    return;
  }

  lockAudio();
ownsAudioLock = true;


  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
  console.log("🎧 Mic permission denied");
  if (ownsAudioLock) {
    unlockAudio();
    ownsAudioLock = false;
  }
  return;
}


  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  recording = new Audio.Recording();

  await recording.prepareToRecordAsync({
    ...Audio.RecordingOptionsPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });

  await recording.startAsync();
  console.log("🎧 Idle audio monitor started");

  intervalId = setInterval(async () => {
    if (!recording) return;

    const status = await recording.getStatusAsync();
    if (!status.isRecording || status.metering == null) return;

    const rms = Math.abs(status.metering) / 160;
    console.log("🔊 RMS:", rms.toFixed(3));

    const now = Date.now();
    if (
  rms > AUDIO_RMS_THRESHOLD &&
  now - lastTrigger > SUSPICION_COOLDOWN_MS
) {
  lastTrigger = now;
  console.log("⚠️ Suspicion detected");

  await stopIdleAudioMonitor(); // 🔥 CRITICAL
  if (stateManager.canTriggerSuspicion()) {
  stateManager.setTier(Tier.SUSPICION);
}

}

  }, IDLE_SAMPLE_INTERVAL);
}

export async function stopIdleAudioMonitor() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (recording) {
    try {
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
      }
    } catch (e) {
      console.warn("⚠️ Error stopping idle recorder", e);
    }
    recording = null;
  }

  if (ownsAudioLock) {
    unlockAudio();
    ownsAudioLock = false;
  }

  console.log("🛑 Idle audio monitor stopped");
}
