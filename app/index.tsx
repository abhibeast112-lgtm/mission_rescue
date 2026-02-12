import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const pulse = useRef(new Animated.Value(0)).current;
  const [listening, setListening] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  return (
    <LinearGradient
      colors={["#0a0f1f", "#05070f"]}
      style={styles.container}
    >
      <Text style={styles.title}>echo-Locator</Text>

      
      <View style={styles.radarContainer}>
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
        <View style={styles.centerDot} />
      </View>

      
      <View style={styles.card}>
        <Text style={styles.status}>
          {listening ? "🎧 Listening for distress..." : "🛑 Not Listening"}
        </Text>
        <Text style={styles.sub}>
          Mesh Network: Active
        </Text>
      </View>

      
      <Pressable
        onPress={() => setListening(!listening)}
        style={({ pressed }) => [
          styles.button,
          { transform: [{ scale: pressed ? 0.92 : 1 }] },
        ]}
      >
        <Text style={styles.buttonText}>
          {listening ? "STOP LISTENING" : "START LISTENING"}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#00ffd5",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  pulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#00ffd5",
  },
  centerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00ffd5",
  },
  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: "80%",
    alignItems: "center",
  },
  status: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 6,
  },
  sub: {
    color: "#9ca3af",
  },
  button: {
    backgroundColor: "#00ffd5",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
  },
});