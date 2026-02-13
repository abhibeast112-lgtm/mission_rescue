
export async function sendAudioToML(audioUri: string) {
  const formData = new FormData();

  formData.append("file", {
    uri: audioUri,
    name: "audio.wav",
    type: "audio/wav"
  } as any);

  const response = await fetch("http://YOUR_IP:8000/predict", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return await response.json();
}

