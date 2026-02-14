import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { getNodes } from "../mesh/nodeStore";

export default function MapScreen() {
  const nodes = getNodes();

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}>
        {nodes.map((n) =>
          n.lat && n.lon ? (
            <Marker
              key={n.id}
              coordinate={{ latitude: n.lat, longitude: n.lon }}
              title={n.id}
            />
          ) : null
        )}
      </MapView>
    </View>
  );
}