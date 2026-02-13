// mesh/transport.ts
import { AlertV1 } from "../core/types";
import { onAlert as onWsAlert, connectWS, sendAlertWS } from "./wsTransport";

type Listener = (a: AlertV1) => void;
const localListeners = new Set<Listener>();

// subscribe used by your app to receive alerts
export function subscribeAlerts(fn: Listener) {
  localListeners.add(fn);
  return () => localListeners.delete(fn);
}

function emitLocal(a: AlertV1) {
  for (const fn of localListeners) fn(a);
}

// connect from UI / app start
export async function meshConnect(wsUrl: string, room = "default") {
  await connectWS(wsUrl, room);

  // bridge WS incoming -> app listeners
  onWsAlert((a) => emitLocal(a));
}

// called by app to broadcast
export async function broadcastAlert(alert: AlertV1) {
  // also emit to self immediately so UI updates
  emitLocal(alert);

  // send to network
  await sendAlertWS(alert);
}
