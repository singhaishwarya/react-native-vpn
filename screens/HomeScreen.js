import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Alert,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import RNSimpleOpenvpn from "react-native-simple-openvpn";
import RNFS from "react-native-fs";
import InternetSpeed from "react-native-internet-speed";
import WorldMapSvg from "../assets/world.svg"; // world map asset

// Shared VPN list
export const vpnList = [
  { name: "Sweden", file: "Sweden1.ovpn", flag: "https://flagcdn.com/w320/se.png", ip: "132.225.2.234" },
  { name: "Turkey", file: "Turkey1.ovpn", flag: "https://flagcdn.com/w320/tr.png", ip: "192.168.2.123" },
  { name: "China", file: "HongKong1.ovpn", flag: "https://flagcdn.com/w320/cn.png", ip: "119.28.45.12" },
  { name: "South Africa", file: "Africa1.ovpn", flag: "https://flagcdn.com/w320/za.png", ip: "119.28.45.13" },
  { name: "Poland", file: "Poland1.ovpn", flag: "https://flagcdn.com/w320/pl.png", ip: "51.83.142.67" },
  { name: "United States", file: "USA1.ovpn", flag: "https://flagcdn.com/w320/us.png", ip: "34.201.45.76" },
  { name: "Canada", file: "Canada1.ovpn", flag: "https://flagcdn.com/w320/ca.png", ip: "142.250.72.14" },
  { name: "Brazil", file: "Brazil1.ovpn", flag: "https://flagcdn.com/w320/br.png", ip: "177.12.45.32" },
  { name: "Australia", file: "Australia1.ovpn", flag: "https://flagcdn.com/w320/au.png", ip: "13.54.12.23" },
];

export default function HomeScreen({ route }) {
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [selectedVpn, setSelectedVpn] = useState(null); // initially no VPN selected

  // If user selects a VPN from Countries tab
  useEffect(() => {
    if (route.params?.selectedVpn) {
      setSelectedVpn(route.params.selectedVpn);
    }
  }, [route.params?.selectedVpn]);

  // Copy VPN config files from assets
  useEffect(() => {
    vpnList.forEach(async (vpn) => {
      const dest = `${RNFS.ExternalDirectoryPath}/${vpn.file}`;
      const exists = await RNFS.exists(dest);
      if (!exists) {
        await RNFS.copyFileAssets(vpn.file, dest);
      }
    });
  }, []);

  // Internet speed + timer
  useEffect(() => {
    let interval = null;
    if (connected) {
      InternetSpeed.startListenInternetSpeed(({ downLoadSpeed, upLoadSpeed }) => {
        setDownloadSpeed(downLoadSpeed);
        setUploadSpeed(upLoadSpeed);
      });

      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      InternetSpeed.stopListenInternetSpeed();
      clearInterval(interval);
      setTime(0);
    }
    return () => {
      InternetSpeed.stopListenInternetSpeed();
      clearInterval(interval);
    };
  }, [connected]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `00:${m}:${ss}`;
  };

  // VPN connect/disconnect
  const connectVpn = async () => {
    if (!selectedVpn) {
      Alert.alert("Select a Country", "Please choose a country in the Countries tab first.");
      return;
    }
    try {
      const configPath = `${RNFS.ExternalDirectoryPath}/${selectedVpn}`;
      const configExists = await RNFS.exists(configPath);
      if (!configExists) await RNFS.copyFileAssets(selectedVpn, configPath);

      const ovpnConfig = await RNFS.readFile(configPath, "utf8");
      await RNSimpleOpenvpn.connect({
        ovpnString: ovpnConfig,
        notificationTitle: "Vulture VPN",
        compatMode: RNSimpleOpenvpn.CompatMode.OVPN_TWO_THREE_PEER,
        providerBundleIdentifier: "com.vpn3001",
        localizedDescription: "Vulture VPN",
      });

      setConnected(true);
      setTime(0);
    } catch (error) {
      Alert.alert("Connection Failed", error.message);
    }
  };

  const disconnectVpn = async () => {
    try {
      await RNSimpleOpenvpn.disconnect();
      setConnected(false);
    } catch (error) {
      Alert.alert("Disconnection Failed", error.message);
    }
  };

  const toggleVpn = () => (connected ? disconnectVpn() : connectVpn());

  const currentVpn = vpnList.find((v) => v.file === selectedVpn);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../assets/red-header.png")}
        style={styles.header}
        imageStyle={styles.headerBg}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Vulture VPN</Text>
          <Text style={styles.statusText}>VPN Status Is</Text>
          <Text style={styles.connectedText}>
            {connected ? "Connected" : "Disconnected"}
          </Text>
        </View>
      </ImageBackground>

      {/* Power Button */}
      <TouchableOpacity style={styles.hexWrapper} onPress={toggleVpn}>
        <Svg height="120" width="120" viewBox="0 0 100 100">
          <Polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="#fff"
            stroke={connected ? "#e53935" : "#000"}
            strokeWidth="4"
          />
        </Svg>
        <View
          style={[
            styles.powerIconWrapper,
            { backgroundColor: connected ? "#e53935" : "#000" },
          ]}
        >
          <MaterialCommunityIcons name="power" size={32} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Speeds */}
      {connected && (
        <View style={styles.speedRow}>
          <View style={styles.speedBlock}>
            <Image
              source={require("../assets/double-arrow.png")}
              style={[styles.arrowImage, { tintColor: "#e53935" }]}
            />
            <View style={styles.speedTextContainer}>
              <Text style={styles.speedLabel}>Upload</Text>
              <Text style={styles.speedNumber}>
                {uploadSpeed ? `${uploadSpeed} Kbps` : "--"}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.speedBlock}>
            <Image
              source={require("../assets/down-arrow.png")}
              style={[styles.arrowImage, { tintColor: "#000" }]}
            />
            <View style={styles.speedTextContainer}>
              <Text style={styles.speedLabel}>Download</Text>
              <Text style={styles.speedNumber}>
                {downloadSpeed ? `${downloadSpeed} Kbps` : "--"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Session Time */}
      {connected && (
        <View style={styles.sessionContainer}>
          <Text style={styles.sessionLabel}>Session Time</Text>
          <Text style={styles.timer}>{formatTime(time)}</Text>
        </View>
      )}

      {/* World Map - Always visible */}
      <View style={styles.mapContainer}>
        <Svg
          width={Dimensions.get("window").width * 1.1}
          height={200}
          viewBox="140 10 1900 800"
        >
          {React.Children.map(WorldMapSvg().props.children, (child) => {
            if (!child?.props) return child;
            const countryName = child.props["data-name"]?.toLowerCase();

            if (
              connected &&
              currentVpn &&
              countryName === currentVpn.name.toLowerCase()
            ) {
              return React.cloneElement(child, { fill: "#e53935" }); // highlight
            }
            return React.cloneElement(child, { fill: "#ccc" }); // gray otherwise
          })}
        </Svg>
      </View>

      {/* Location Info */}
      {currentVpn && connected && (
        <View style={styles.locationBox}>
          <Image source={{ uri: currentVpn.flag }} style={styles.flag} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.locationName}>{currentVpn.name}</Text>
            <Text style={styles.ip}>IP address: {currentVpn.ip}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  divider: { width: 1, height: 45, backgroundColor: "#ccc", marginHorizontal: 12 },
  header: { width: Dimensions.get("window").width + 10, height: 400, alignItems: "center", justifyContent: "flex-start", paddingTop: 70, overflow: "hidden" },
  headerBg: { resizeMode: "stretch" },
  titleContainer: { alignItems: "center", marginTop: -10 },
  title: { color: "#fff", fontSize: 18, fontWeight: "600", letterSpacing: 1 },
  statusText: { color: "#fff", fontSize: 14, marginTop: 15, opacity: 0.9 },
  connectedText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 2 },
  hexWrapper: { marginTop: -250, alignItems: "center", justifyContent: "center" },
  powerIconWrapper: { position: "absolute", top: 35, left: 35, width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  speedRow: { flexDirection: "row", justifyContent: "space-between", width: "85%", marginTop: 20 },
  speedBlock: { flexDirection: "row", alignItems: "center" },
  arrowImage: { width: 26, height: 26, resizeMode: "contain" },
  speedTextContainer: { marginLeft: 8 },
  speedLabel: { fontSize: 12, color: "#666", fontWeight: "600" },
  speedNumber: { fontSize: 18, fontWeight: "700", color: "#333", marginTop: 4 },
  sessionContainer: { alignItems: "center", marginTop: 10 },
  sessionLabel: { fontSize: 16, fontWeight: "600", color: "#777" },
  timer: { fontSize: 32, fontWeight: "800", color: "#e53935" },
  mapContainer: { marginTop: 10, alignItems: "center", justifyContent: "center" },
  locationBox: { flexDirection: "row", alignItems: "center", padding: 15, marginHorizontal: 20, backgroundColor: "#f7f7f7", borderRadius: 10, marginTop: 10 },
  flag: { width: 40, height: 28, borderRadius: 4, resizeMode: "cover" },
  locationName: { fontSize: 16, fontWeight: "600", color: "#000" },
  ip: { fontSize: 12, color: "#666" },
});
