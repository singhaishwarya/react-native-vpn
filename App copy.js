import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Alert,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNSimpleOpenvpn from 'react-native-simple-openvpn';
import RNFS from 'react-native-fs';
import InternetSpeed from 'react-native-internet-speed';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [selectedVpn, setSelectedVpn] = useState('Sweden1.ovpn');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const vpnList = [
    {
      name: 'Sweden',
      file: 'Sweden1.ovpn',
      flag: 'https://flagcdn.com/w320/se.png',
      ip: '132.225.2.234',
    },
    {
      name: 'Turkey',
      file: 'Turkey1.ovpn',
      flag: 'https://flagcdn.com/w320/tr.png',
      ip: '192.168.2.123',
    },
  ];

  useEffect(() => {
    vpnList.forEach(async (vpn) => {
      const dest = `${RNFS.ExternalDirectoryPath}/${vpn.file}`;
      const exists = await RNFS.exists(dest);
      if (!exists) {
        await RNFS.copyFileAssets(vpn.file, dest);
      }
    });
  }, []);

  useEffect(() => {
    let interval = null;

    if (connected) {
      InternetSpeed.startListenInternetSpeed(({ downLoadSpeed, upLoadSpeed }) => {
        setDownloadSpeed(downLoadSpeed);
        setUploadSpeed(upLoadSpeed);
      });

      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
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
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `00:${m}:${ss}`;
  };

  const connectVpn = async () => {
    try {
      const configPath = `${RNFS.ExternalDirectoryPath}/${selectedVpn}`;
      const configExists = await RNFS.exists(configPath);

      if (!configExists) {
        await RNFS.copyFileAssets(selectedVpn, configPath);
      }

      const ovpnConfig = await RNFS.readFile(configPath, 'utf8');

      await RNSimpleOpenvpn.connect({
        ovpnString: ovpnConfig,
        notificationTitle: 'Vulture VPN',
        compatMode: RNSimpleOpenvpn.CompatMode.OVPN_TWO_THREE_PEER,
        providerBundleIdentifier: 'com.vulturevpn',
        localizedDescription: 'Vulture VPN',
      });

      setConnected(true);
      setTime(0);
    } catch (error) {
      Alert.alert('Connection Failed', error.message);
      console.error(error);
    }
  };

  const disconnectVpn = async () => {
    try {
      await RNSimpleOpenvpn.disconnect();
      setConnected(false);
    } catch (error) {
      Alert.alert('Disconnection Failed', error.message);
      console.error(error);
    }
  };

  const toggleVpn = () => {
    if (connected) {
      disconnectVpn();
    } else {
      connectVpn();
    }
  };

  const currentVpn = vpnList.find((v) => v.file === selectedVpn);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('./assets/red-header.png')}
        style={styles.header}
        imageStyle={styles.headerBg}
      >
        <View style={styles.topNavigation}>
          <TouchableOpacity style={styles.topButton}>
            <MaterialCommunityIcons name="view-grid" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton}>
            <MaterialCommunityIcons name="pause" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Vulture VPN</Text>
          <Text style={styles.statusText}>VPN Status Is</Text>
          <Text style={styles.connectedText}>
            {connected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </ImageBackground>

      {/* Power Button */}
      <TouchableOpacity style={styles.hexWrapper} onPress={toggleVpn}>
        <Svg height="120" width="120" viewBox="0 0 100 100">
          <Polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="#fff"
            stroke={connected ? '#e53935' : '#000'}
            strokeWidth="4"
          />
        </Svg>
        <View
          style={[
            styles.powerIconWrapper,
            { backgroundColor: connected ? '#e53935' : '#000' },
          ]}
        >
          <MaterialCommunityIcons name="power" size={32} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Speed Info */}
      {connected && (
        <View style={styles.speedRow}>
          <View style={styles.speedBlock}>
            <Image
              source={require('./assets/double-arrow.png')}
              style={[styles.arrowImage, { tintColor: '#e53935' }]}
            />
            <View style={styles.speedTextContainer}>
              <Text style={styles.speedLabel}>Upload</Text>
              <Text style={styles.speedNumber}>
                {uploadSpeed ? `${uploadSpeed} Kbps` : '--'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.speedBlock}>
            <Image
              source={require('./assets/down-arrow.png')}
              style={[styles.arrowImage, { tintColor: '#000' }]}
            />
            <View style={styles.speedTextContainer}>
              <Text style={styles.speedLabel}>Download</Text>
              <Text style={styles.speedNumber}>
                {downloadSpeed ? `${downloadSpeed} Kbps` : '--'}
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

      {/* Location Info + Server Selector */}
      {connected && (
        <>
          <TouchableOpacity
            style={styles.locationBox}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: currentVpn?.flag }} style={styles.flag} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.locationName}>{currentVpn?.name}</Text>
              <Text style={styles.ip}>IP address: {currentVpn?.ip}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#ccc"
              style={styles.locationArrow}
            />
          </TouchableOpacity>

          {/* Dropdown Modal */}
          <Modal
            animationType="fade"
            transparent
            visible={dropdownVisible}
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setDropdownVisible(false)}
            >
              <View style={styles.centeredModal}>
                <View style={styles.modalContent}>
                  {vpnList.map((vpn) => (
                    <TouchableOpacity
                      key={vpn.file}
                      onPress={async () => {
                        if (vpn.file === selectedVpn) return;
                        setDropdownVisible(false);
                        await disconnectVpn();
                        setSelectedVpn(vpn.file);
                        setTimeout(connectVpn, 500);
                      }}
                      style={[
                        styles.modalItem,
                        vpn.file === selectedVpn && styles.selectedItem,
                      ]}
                    >
                      <Text
                        style={{
                          color: vpn.file === selectedVpn ? '#fff' : '#000',
                          fontWeight: '600',
                          textAlign: 'center',
                        }}
                      >
                        {vpn.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 45,
    backgroundColor: "#ccc",
    marginHorizontal: 12,
  },
  header: {
    width: Dimensions.get("window").width + 10,
    height: 580,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 90,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 70,
    overflow: "hidden",
    position: "relative",
  },
  headerBg: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 90,
    resizeMode: "stretch",
  },
  topNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
    position: "absolute",
    top: 50,
    zIndex: 10,
  },
  topButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 30,
  }, title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 0,
    letterSpacing: 1,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    marginTop: 15,
    opacity: 0.9,
  },
  connectedText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  status: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  hexWrapper: {
    marginTop: -300,
    alignItems: "center",
    justifyContent: "center",
  },
  powerIconWrapper: {
    position: "absolute",
    top: 35,
    left: 35,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  speedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  speedBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  speedTextContainer: {
    marginLeft: 8,
  },
  speedLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  speedNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  sessionContainer: {
    alignItems: "center",
    marginTop: 25,
  },
  sessionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  timer: {
    fontSize: 32,
    fontWeight: "800",
    color: "#e53935",
    marginTop: 8,
  },
 
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginTop: 20,
  },
  flag: {
    width: 40,
    height: 28,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  ip: {
    fontSize: 12,
    color: '#666',
  },
  locationArrow: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 5,
  },
  modalContent: {
    width: '100%',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  selectedItem: {
    backgroundColor: '#e53935',
  },
});
