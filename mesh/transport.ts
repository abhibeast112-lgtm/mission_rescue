import { AlertV1 } from "../core/types";

type Listener = (alert: AlertV1) => void;

const listeners = new Set<Listener>();

let ws: WebSocket | null = null;
let isOpen = false;

export function subscribeAlerts(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb); // ✅ return void (not boolean)
  };
}

function emit(alert: AlertV1) {
  listeners.forEach((cb) => cb(alert));
}

// ✅ Call this once on app start (in _layout.tsx)
export function meshConnect(url: string) {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  console.log("🌐 connecting to mesh:", url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    isOpen = true;
    console.log("✅ mesh connected");
  };

  ws.onclose = () => {
    isOpen = false;
    console.log("❌ mesh disconnected");
    ws = null;
  };

  ws.onerror = (e) => {
    console.log("❌ mesh error", e);
  };

  ws.onmessage = (event) => {
    try {
      const data = typeof event.data === "string" ? event.data : "";
      console.log("📥 ws message received:", data);

      const msg = JSON.parse(data);

      // We send raw AlertV1 JSON, so msg itself is the alert
      if (msg && msg.v === 1 && msg.id) {
        emit(msg as AlertV1);
      }
    } catch (e) {
      console.log("⚠️ bad ws message", e);
    }
  };
}

// ✅ This is the “rescue signal send”
export async function broadcastAlert(alert: AlertV1) {
  console.log("📡 sending over ws:", isOpen, ws?.readyState);

  if (!ws || !isOpen) {
    console.log("⚠️ mesh not connected, cannot send");
    return;
  }

  ws.send(JSON.stringify(alert));
  console.log("📡 sent alert:", alert.id);
}
