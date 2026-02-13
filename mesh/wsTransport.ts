// mesh/wsTransport.ts
import { AlertV1 } from "../core/types";
import { getDeviceId } from "../core/deviceId";

type Handler = (a: AlertV1) => void;

let ws: WebSocket | null = null;
let handlers = new Set<Handler>();
let isReady = false;
let currentRoom = "default";

export function onAlert(handler: Handler) {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

function emit(alert: AlertV1) {
  for (const h of handlers) h(alert);
}

export function isWsConnected() {
  return !!ws && ws.readyState === 1 && isReady;
}

/**
 * wsUrl example: ws://192.168.1.10:8787
 */
export async function connectWS(wsUrl: string, room = "default") {
  currentRoom = room;

  // close old
  try {
    ws?.close();
  } catch {}
  ws = null;
  isReady = false;

  const id = await getDeviceId();
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws?.send(JSON.stringify({ type: "HELLO", id, room }));
  };

  ws.onmessage = (event) => {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (data.type === "WELCOME") {
      isReady = true;
      return;
    }

    if (data.type === "ALERT" && data.alert) {
      emit(data.alert as AlertV1);
      return;
    }
  };

  ws.onerror = () => {
    isReady = false;
  };

  ws.onclose = () => {
    isReady = false;
  };
}

export async function sendAlertWS(alert: AlertV1) {
  if (!ws || ws.readyState !== 1) {
    // not connected: fail silently (demo safe)
    return;
  }
  ws.send(JSON.stringify({ type: "ALERT", room: currentRoom, alert }));
}

export function disconnectWS() {
  try {
    ws?.close();
  } catch {}
  ws = null;
  isReady = false;
}
