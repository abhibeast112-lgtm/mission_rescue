// mission_rescue/audio/SuspicionRecorder.ts
import { Audio } from "expo-av";
import { lockAudio, unlockAudio, isAudioBusy } from "./AudioLock";

export async function recordSuspicionWindow(ms: number): Promise<string | null> {
  if (isAudioBusy()) {
    console.log(" Audio busy, suspicion recorder blocked");
    return null;
  }

  lockAudio();

  let recording: Audio.Recording | null = null;

  try {
    recording = new Audio.Recording();

    // ✅ Keep LOW_QUALITY for speed; works in Expo Go.
    // If you want better model results, replace with explicit 16k settings later.
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);

    await recording.startAsync();
    await new Promise((res) => setTimeout(res, ms));
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    console.log(" Suspicion audio captured:", uri);

    return uri ?? null;
  } catch (e) {
    console.warn(" Suspicion recording failed", e);
    return null;
  } finally {
    unlockAudio(); // 🔥 ALWAYS release
  }
}
