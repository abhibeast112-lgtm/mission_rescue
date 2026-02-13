import { Stack } from "expo-router";
import { useEchoLocator } from "../hooks/useEchoLocator";

export default function RootLayout() {
  useEchoLocator(); // 🔥 THIS IS THE MISSING LINK

  return <Stack />;
}
