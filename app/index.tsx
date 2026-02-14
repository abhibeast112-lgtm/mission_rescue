import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { stateManager } from "../core/StateManager";
import { Tier } from "../core/tiers";
import { broadcastAlert } from "../mesh/transport";
import { saveAlert } from "../storage/alertsStore";
import { getDeviceId } from "../core/deviceId";
import { AlertV1 } from "../core/types";

export default function Home() {
  const router = useRouter();

  const pulse = useRef(new Animated.Value(0)).current;
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const unsub = stateManager.subscribe((t) => {
      setListening(t !== Tier.OFF);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  const startListening = () => stateManager.setTier(Tier.IDLE);
  const stopListening = () => stateManager.setTier(Tier.OFF);

  const triggerConfirmed = async () => {
    console.log("🧪 TEST BUTTON PRESSED");
    try {
      const senderId = await getDeviceId();
      const { getApproxLocation } = await import("../core/location");

      let approxLocation: { lat: number; lon: number; accuracyM?: number } | undefined;
      try {
        approxLocation = await getApproxLocation();
      } catch (e) {
        console.log("location unavailable");
      }

      const alert: AlertV1 = {
        v: 1 as const,
        id: "a_" + Date.now().toString(36),
        createdAt: Date.now(),
        senderId,
        hop: 0,
        ttl: 6,
        confidence: 0.85,
        tier: "CONFIRMED" as const,
        ...(approxLocation ? { approxLocation } : {}),
      };

      console.log("🧪 saving alert:", alert.id);
      await saveAlert(alert);

      console.log("🧪 broadcasting alert:", alert.id);
      await broadcastAlert(alert);

      console.log("✅ TEST ALERT SENT:", alert.id);
    } catch (e) {
      console.log("❌ TEST ALERT FAILED:", e);
    }
  };

  return (
    <LinearGradient colors={["#0a0f1f", "#05070f"]} style={styles.container}>
      <Text style={styles.title}>echo-Locator</Text>

      <View style={styles.radarContainer}>
        <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity }]} />
        <View style={styles.centerDot} />
      </View>

      <View style={styles.card}>
        <Text style={styles.status}>
          {listening ? "🎧 Listening for distress..." : "🛑 Not Listening"}
        </Text>
        <Text style={styles.sub}>Mesh Network: Active</Text>
      </View>

      {!listening ? (
        <Pressable
          onPress={startListening}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
            styles.buttonInactive,
          ]}
        >
          <Text style={styles.buttonText}>START LISTENING</Text>
        </Pressable>
      ) : (
        <Pressable
          onLongPress={stopListening}
          delayLongPress={700}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.buttonText}>HOLD TO STOP</Text>
        </Pressable>
      )}

      <Pressable onPress={triggerConfirmed} style={styles.button}>
        <Text style={styles.buttonText}>🚨 TEST CONFIRMED ALERT</Text>
      </Pressable>

      <View style={styles.navLinks}>
        <Pressable onPress={() => router.push("/nodes")}> 
          <Text style={styles.linkText}>View Nodes</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/alerts")}> 
          <Text style={styles.linkText}>View Alerts</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    color: "#00ffd5",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    width: 150,
    marginBottom: 40,
  },
  pulse: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00ffd5",
  },
  centerDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00ffd5",
    elevation: 10,
  },
  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: "85%",
    alignItems: "center",
  },
  status: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 6 },
  sub: { color: "#9ca3af", fontSize: 14 },
  button: {
    backgroundColor: "#00ffd5",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonInactive: { backgroundColor: "#064e4b" },
  buttonText: { fontWeight: "bold", color: "#000", fontSize: 16 },
  navLinks: { flexDirection: "row", gap: 20, marginTop: 10 },
  linkText: { color: "#9ca3af", textDecorationLine: "underline" },
});
