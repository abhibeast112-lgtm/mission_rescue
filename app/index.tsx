import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; 
import { Audio } from "expo-av";


export default function Home() {
  const router = useRouter(); 
  const pulse = useRef(new Animated.Value(0)).current;
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);


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
  const startListening = async (): Promise<void> => {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) return;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.LOW_QUALITY
  );

  setRecording(recording);
  setListening(true);
};

const stopListening = async (): Promise<void> => {
  if (!recording) return;

  await recording.stopAndUnloadAsync();
  setRecording(null);
  setListening(false);
};


  return (
    <LinearGradient
      colors={["#0a0f1f", "#05070f"]}
      style={styles.container}
    >
      <Text style={styles.title}>echo-Locator</Text>

      {/* Radar Section */}
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
        onPress={() => {
  listening ? stopListening() : startListening();
}}

        style={({ pressed }) => [
          styles.button,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
          !listening && styles.buttonInactive // Optional style logic
        ]}
      >
        <Text style={styles.buttonText}>
          {listening ? "STOP LISTENING" : "START LISTENING"}
        </Text>
      </Pressable>

      {/* Navigation Example - Moving them inside buttons or a specific logic block */}
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
    textTransform: 'uppercase',
    letterSpacing: 2
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

    shadowColor: "#00ffd5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  status: {
    color: "#fff",
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  sub: {
    color: "#9ca3af",
    fontSize: 14
  },
  button: {
    backgroundColor: "#00ffd5",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20
  },
  buttonInactive: {
    backgroundColor: "#064e4b", 
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10
  },
  linkText: {
    color: "#9ca3af",
    textDecorationLine: 'underline'
  }
});