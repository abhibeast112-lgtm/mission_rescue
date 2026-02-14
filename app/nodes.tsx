import { View, Text, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { startScan, meshEmitter } from "../mesh/bluetooth";
import { addNode, getNodes } from "../mesh/nodeStore";

type Node = {
  id: string;
  lastSeen: number;
};

export default function Nodes() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    startScan();

    const handler = (node: Node) => {
      addNode(node);
      setNodes([...getNodes()]);
    };

    meshEmitter.on("nodeFound", handler);

    // cleanup listener
    return () => {
      meshEmitter.off("nodeFound", handler);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Mesh Nodes</Text>

      <Text style={styles.subtitle}>
        Active Devices: {nodes.length}
      </Text>

      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.id}>{item.id}</Text>
            <Text style={styles.time}>
              Last seen {Math.floor((Date.now() - item.lastSeen) / 1000)}s ago
            </Text>
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
    marginBottom: 10,
  },
  subtitle: {
    color: "#9ca3af",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  id: { color: "#fff", fontWeight: "600" },
  time: { color: "#9ca3af", marginTop: 4 },
});