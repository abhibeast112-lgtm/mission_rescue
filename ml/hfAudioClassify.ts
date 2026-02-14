// mission_rescue/ml/hfAudioClassify.ts
import * as FileSystem from "expo-file-system";

export type HFLabel = { label: string; score: number };

const HF_MODEL = "qualcomm/YamNet";
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

// .env: EXPO_PUBLIC_HF_TOKEN=hf_xxx
const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN;

// Base64 -> Uint8Array (Expo Go safe)
function base64ToBytes(base64: string): Uint8Array {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let buffer = 0;
  let bits = 0;
  const out: number[] = [];

  for (let i = 0; i < base64.length; i++) {
    const c = base64[i];
    if (c === "=") break;
    const val = chars.indexOf(c);
    if (val < 0) continue;

    buffer = (buffer << 6) | val;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

// Uint8Array -> EXACT ArrayBuffer (fixes ArrayBufferLike error)
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

export async function classifyAudioHF(fileUri: string): Promise<HFLabel[]> {
  if (!HF_TOKEN) throw new Error("Missing EXPO_PUBLIC_HF_TOKEN");

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: "base64" as any, // ✅ works across expo-file-system versions
  });

  const bytes = base64ToBytes(base64);
  const body = new Uint8Array(bytes).slice().buffer as ArrayBuffer;





  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF error ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (Array.isArray(json) && Array.isArray(json[0])) return json[0] as HFLabel[];
  return json as HFLabel[];
}
