import { Stack } from "expo-router";
import { useEffect } from "react";
import { useEchoLocator } from "../hooks/useEchoLocator";
import { meshConnect, subscribeAlerts } from "../mesh/transport";
import { saveAlert } from "../storage/alertsStore";

export default function RootLayout() {
  useEchoLocator();

  useEffect(() => {
    // ✅ change IP if needed
    meshConnect("ws://172.18.231.10:8787");

    const unsub = subscribeAlerts(async (a) => {
      console.log("📥 RECEIVED ALERT:", a.id);
      await saveAlert(a);
    });

    return () => unsub();
  }, []);

  return <Stack />;
}
