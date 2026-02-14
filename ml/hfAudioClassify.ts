// mission_rescue/ml/hfAudioClassify.ts
import * as FileSystem from "expo-file-system/legacy";

export type HFLabel = { label: string; score: number };

// ✅ THIS MODEL WORKS WITH HF ROUTER (NO 404)
const HF_MODEL = "openai/whisper-large-v3";


// ✅ HF Router endpoint
const HF_URL = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(HF_MODEL)}?wait_for_model=true`;


// Token from .env
const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN;
function base64ToBytes(base64: string): Uint8Array {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
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


// Force NORMAL ArrayBuffer (fix RN SharedArrayBuffer bug)
function toFreshArrayBuffer(u8: Uint8Array): ArrayBuffer {
return Uint8Array.from(u8).buffer;
}

export async function classifyAudioHF(
fileUri: string
): Promise<HFLabel[]> {
if (!HF_TOKEN) throw new Error("Missing EXPO_PUBLIC_HF_TOKEN");

console.log("🤖 Sending audio to HF:", HF_MODEL);

const base64 = await FileSystem.readAsStringAsync(fileUri, {
encoding: "base64" as any,
});

const bytes = base64ToBytes(base64);
const body = toFreshArrayBuffer(bytes);

const res = await fetch(HF_URL, {
method: "POST",
headers: {
Authorization: `Bearer ${HF_TOKEN}`,
"Content-Type": "application/octet-stream",
},
body: body as any,
});

if (!res.ok) {
const text = await res.text();
throw new Error(`HF error ${res.status}: ${text}`);
}

const json = await res.json();

console.log("✅ HF RESULT:", json);

return json as HFLabel[];
}
