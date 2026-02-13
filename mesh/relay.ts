import { AlertV1 } from "../core/types";
import { broadcastAlert, onAlertReceived } from "./transport";
import { saveAlert } from "../storage/alertsStore";

export function initRelay() {
  return onAlertReceived(async (alert) => {
    await saveAlert(alert);

    // relay if ttl not exhausted
    if (alert.hop >= alert.ttl) return;

    const relayed: AlertV1 = {
      ...alert,
      hop: alert.hop + 1,
    };

    await broadcastAlert(relayed);
  });
}
