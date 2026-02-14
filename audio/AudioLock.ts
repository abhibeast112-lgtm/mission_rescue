let audioLocked = false;

export function isAudioBusy(): boolean {
  return audioLocked;
}

export function lockAudio(): void {
  if (audioLocked) {
    console.warn(" Audio already locked");
    return;
  }
  audioLocked = true;
  console.log(" Audio locked");
}

export function unlockAudio(): void {
  if (!audioLocked) {
    console.warn(" Audio already unlocked");
    return;
  }
  audioLocked = false;
  console.log(" Audio unlocked");
}
