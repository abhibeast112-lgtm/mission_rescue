import { View, Text, StyleSheet, FlatList, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { startScan, meshEmitter } from "../mesh/bluetooth";
import { addNode, getNodes } from "../mesh/nodeStore";

type Node = {
  id: string;
  lastSeen: number;
  rssi?: number;
  lat?:number;
  lon?:number;
};

export default function Nodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startScan();

    const handler = (node: Node) => {
      addNode(node);
      setNodes([...getNodes()]);
    };

    meshEmitter.on("nodeFound", handler);

    return () => {
      meshEmitter.off("nodeFound", handler);
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const estimateDistance = (rssi?: number) => {
    if (!rssi) return "?";
    const distance = Math.pow(10, (-69 - rssi) / 20);
    return distance.toFixed(1);
  };

  const signalBars = (rssi?: number) => {
    if (!rssi) return 1;
    if (rssi > -55) return 4;
    if (rssi > -70) return 3;
    if (rssi > -85) return 2;
    return 1;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesh Radar</Text>

      <View style={styles.radar}>
        <Animated.View
          style={[styles.pulse, { transform: [{ scale }], opacity }]}
        />
        <View style={styles.centerDot} />
      </View>

      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.id}>{item.id}</Text>

            <Text style={styles.meta}>
              📏 ~{estimateDistance(item.rssi)} m
            </Text>

            <View style={styles.signalRow}>
              {Array.from({ length: signalBars(item.rssi) }).map((_, i) => (
                <View key={i} style={styles.signalBar} />
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#05070f" },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#00ffd5",
    marginBottom: 20,
  },

  radar: {
    alignItems: "center",
    justifyContent: "center",
    height: 160,
    marginBottom: 20,
  },

  pulse: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00ffd5",
  },

  centerDot: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#00ffd5",
  },

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  id: { color: "#fff", fontWeight: "600", marginBottom: 4 },

  meta: { color: "#9ca3af", marginBottom: 6 },

  signalRow: { flexDirection: "row", gap: 4 },

  signalBar: {
    width: 6,
    height: 14,
    backgroundColor: "#00ffd5",
    borderRadius: 2,
  },
});