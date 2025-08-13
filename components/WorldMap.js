import React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import baseMap from "../assets/WorldMap";

export default function WorldMap({ selectedCountry }) {
  // Change the selected country fill color
  const highlightedSvg = baseSvg.replace(
  new RegExp(`id="${countryCode}" fill="[^"]*"`, 'g'),
  `id="${countryCode}" fill="#e53935"`
);


  return (
    <View style={styles.container}>
      <SvgXml xml={highlightedSvg} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "50%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});
