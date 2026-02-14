import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertV1 } from "../core/types";

const KEY = "mission_rescue_alerts";

export async function loadAlerts(): Promise<AlertV1[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.log("loadAlerts failed", e);
    return [];
  }
}

export async function saveAlert(alert: AlertV1) {
  try {
    const existing = await loadAlerts();

    const alreadyExists = existing.find(a => a.id === alert.id);
    if (alreadyExists) return;

    existing.push(alert);
    await AsyncStorage.setItem(KEY, JSON.stringify(existing));
  } catch (e) {
    console.log("saveAlert failed", e);
  }
}