import { AlertV1 } from "../core/types";

type Listener = (alert: AlertV1) => void;

let listeners = new Set<Listener>();

export function onAlertReceived(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// STUB: later replace this with BLE/Wi-Fi Direct send
export async function broadcastAlert(alert: AlertV1) {
  console.log("📡 [mesh stub] broadcasting alert:", alert.id);
  // For now, simulate immediate local receive:
  listeners.forEach((cb) => cb(alert));
}
