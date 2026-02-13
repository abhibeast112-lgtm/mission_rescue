import * as Location from "expo-location";

export async function getApproxLocation(): Promise<
  | { lat: number; lon: number; accuracyM?: number }
  | undefined
> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return undefined;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
      accuracyM: loc.coords.accuracy ?? undefined,
    };
  } catch {
    return undefined;
  }
}
