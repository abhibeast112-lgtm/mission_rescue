import { View, Text, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { loadAlerts } from "../storage/alertsStore";
import { AlertV1 } from "../core/types";

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertV1[]>([]);

  const refresh = async () => {
    try {
      const data = await loadAlerts();
      setAlerts(data.reverse());
    } catch (e) {
      console.log("failed loading alerts", e);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const renderItem = ({ item }: { item: AlertV1 }) => (
    <View style={styles.card}>
      <Text style={styles.id}>ID: {item.id}</Text>
      <Text style={styles.tier}>Tier: {item.tier}</Text>
      <Text style={styles.time}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Received Alerts</Text>

      <FlatList
        data={alerts}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No alerts yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05070f", padding: 20 },
  title: {
    fontSize: 26,
    color: "#00ffd5",
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  id: { color: "#fff" },
  tier: { color: "#00ffd5" },
  time: { color: "#9ca3af", fontSize: 12 },
  empty: { color: "#777", marginTop: 40, textAlign: "center" },
});