import { Audio } from "expo-av";
import { lockAudio, unlockAudio, isAudioBusy } from "./AudioLock";

export async function recordSuspicionWindow(ms: number) {
  if (isAudioBusy()) {
    console.log("🔒 Audio busy, suspicion recorder blocked");
    return null;
  }

  lockAudio();

  let recording: Audio.Recording | null = null;

  try {
    recording = new Audio.Recording();

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.LOW_QUALITY
    );

    await recording.startAsync();
    await new Promise(res => setTimeout(res, ms));
    await recording.stopAndUnloadAsync();

    console.log("🎧 Suspicion audio captured");
    return recording;
  } catch (e) {
    console.warn("⚠️ Suspicion recording failed", e);
    return null;
  } finally {
    unlockAudio(); // 🔥 ALWAYS release
  }
}
