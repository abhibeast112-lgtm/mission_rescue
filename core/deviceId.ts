import * as SecureStore from "expo-secure-store";

const KEY = "echo_locator_device_id_v1";

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) return existing;

  const id = "dev_" + randomId();
  await SecureStore.setItemAsync(KEY, id);
  return id;
}
