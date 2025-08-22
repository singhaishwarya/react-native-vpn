import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { vpnList } from "./HomeScreen";

export default function CountriesScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {vpnList.map((vpn) => (
        <TouchableOpacity
          key={vpn.file}
          style={styles.card}
          onPress={() =>
            navigation.navigate("Home", { selectedVpn: vpn.file })
          }
        >
          <Image source={{ uri: vpn.flag }} style={styles.flag} />
          <Text style={styles.country}>{vpn.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f7f7f7",
    marginBottom: 12,
  },
  flag: { width: 40, height: 28, borderRadius: 4 },
  country: { marginLeft: 12, fontSize: 16, fontWeight: "600", color:"#000" },
});
