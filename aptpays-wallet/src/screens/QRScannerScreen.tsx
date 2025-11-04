import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS} from '@/theme';

const QRScannerScreen = ({navigation}: any) => {
  const [scanned, setScanned] = useState(false);

  const onSuccess = (e: any) => {
    if (scanned) return;
    setScanned(true);

    const data = e.data;
    
    // Parse QR code data (expected format: "aptos:0x...")
    let address = '';
    let amount = '';

    if (data.startsWith('aptos:')) {
      const parts = data.replace('aptos:', '').split('?');
      address = parts[0];
      
      if (parts[1]) {
        const params = new URLSearchParams(parts[1]);
        amount = params.get('amount') || '';
      }
    } else if (data.startsWith('0x')) {
      address = data;
    } else {
      Alert.alert('Invalid QR Code', 'This QR code is not a valid Aptos address');
      setScanned(false);
      return;
    }

    // Navigate to Send screen with pre-filled data
    navigation.navigate('Send', {
      recipient: address,
      amount: amount,
    });
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={
          <View style={styles.header}>
            <Text style={styles.title}>Scan QR Code</Text>
            <Text style={styles.subtitle}>
              Point your camera at a QR code to scan
            </Text>
          </View>
        }
        bottomContent={
          <View style={styles.footer}>
            <Icon name="qr-code" size={48} color={COLORS.textSecondary} />
            <Text style={styles.footerText}>
              Align QR code within the frame
            </Text>
          </View>
        }
        cameraStyle={styles.camera}
        markerStyle={styles.marker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  camera: {
    height: '100%',
  },
  marker: {
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});

export default QRScannerScreen;
