import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertV1 } from "../core/types";

const KEY = "echo_locator_alerts_v1";

export async function loadAlerts(): Promise<AlertV1[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AlertV1[];
  } catch {
    return [];
  }
}

export async function saveAlert(alert: AlertV1) {
  const prev = await loadAlerts();
  // dedupe by id
  if (prev.some(a => a.id === alert.id)) return;
  const next = [alert, ...prev].slice(0, 200);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
