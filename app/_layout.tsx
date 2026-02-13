import { Stack } from "expo-router";
import { useEffect } from "react";
import { subscribeAlerts, meshConnect } from "../mesh/transport";
import { saveAlert } from "../storage/alertsStore";
import { useEchoLocator } from "../hooks/useEchoLocator";


export default function RootLayout() {
  useEchoLocator();

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const run = async () => {
      await meshConnect("ws://172.18.231.10:8787", "demo");

      unsub = subscribeAlerts(async (a) => {
        await saveAlert(a);
      });
    };

    run();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return <Stack />;
}
