import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import {useAppStore} from '@/store';
import aptosService from '@/services/aptosService';

const NFCPayScreen = ({navigation}: any) => {
  const {wallet, addTransaction, updateXP} = useAppStore();
  const [isReading, setIsReading] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);

  useEffect(() => {
    checkNfcSupport();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const checkNfcSupport = async () => {
    try {
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);
      if (supported) {
        await NfcManager.start();
      }
    } catch (error) {
      console.error('NFC check error:', error);
    }
  };

  const readNfc = async () => {
    if (!nfcSupported) {
      Alert.alert('Not Supported', 'NFC is not supported on this device');
      return;
    }

    try {
      setIsReading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      console.log('Tag found:', tag);

      if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];
        const payloadText = Ndef.text.decodePayload(ndefRecord.payload);

        // Expected format: "aptos:0x...?amount=10"
        const [address, amountParam] = payloadText.split('?');
        const recipient = address.replace('aptos:', '');
        const amount = amountParam
          ? parseFloat(amountParam.split('=')[1])
          : 0;

        if (!/^0x[a-fA-F0-9]{64}$/.test(recipient)) {
          Alert.alert('Error', 'Invalid payment data on NFC tag');
          return;
        }

        Alert.alert(
          'NFC Payment',
          `Send ${amount} APT to ${recipient.slice(0, 10)}...?`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Pay',
              onPress: async () => {
                try {
                  const txHash = await aptosService.transfer(
                    wallet.privateKey!,
                    recipient,
                    amount
                  );

                  addTransaction({
                    hash: txHash,
                    type: 'send',
                    from: wallet.address!,
                    to: recipient,
                    amount,
                    token: 'APT',
                    timestamp: Date.now(),
                    status: 'success',
                  });

                  updateXP(25);

                  Alert.alert('Success!', `Paid ${amount} APT via NFC`, [
                    {text: 'OK', onPress: () => navigation.goBack()},
                  ]);
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Payment failed');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'No payment data found on NFC tag');
      }
    } catch (error) {
      console.error('NFC read error:', error);
      Alert.alert('Error', 'Failed to read NFC tag');
    } finally {
      setIsReading(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const writeNfc = async () => {
    if (!nfcSupported) {
      Alert.alert('Not Supported', 'NFC is not supported on this device');
      return;
    }

    try {
      setIsReading(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Write payment request to NFC tag
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(`aptos:${wallet.address}?amount=10`),
      ]);

      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      Alert.alert('Success!', 'Payment request written to NFC tag');
    } catch (error) {
      console.error('NFC write error:', error);
      Alert.alert('Error', 'Failed to write to NFC tag');
    } finally {
      setIsReading(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>NFC Tap to Pay</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={COLORS.gradientGold}
          style={styles.nfcIconContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Icon
            name={isReading ? 'radio' : 'phone-portrait'}
            size={80}
            color={COLORS.text}
          />
        </LinearGradient>

        <Text style={styles.status}>
          {isReading ? 'Hold your phone near the NFC tag...' : 'Ready to scan'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={readNfc} disabled={isReading}>
            <LinearGradient colors={COLORS.gradientPurple} style={styles.actionButton}>
              <Icon name="scan" size={24} color={COLORS.text} />
              <Text style={styles.actionText}>Read Payment Tag</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={writeNfc} disabled={isReading}>
            <LinearGradient colors={COLORS.gradientBlue} style={styles.actionButton}>
              <Icon name="create" size={24} color={COLORS.text} />
              <Text style={styles.actionText}>Write Payment Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {!nfcSupported && (
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={20} color={COLORS.warning} />
            <Text style={styles.infoText}>
              NFC is not supported on this device. You can still send payments using
              QR codes.
            </Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>How it works:</Text>
          <Text style={styles.instructionText}>
            • Read: Tap an NFC tag to receive payment details
          </Text>
          <Text style={styles.instructionText}>
            • Write: Create your own payment request on an NFC tag
          </Text>
          <Text style={styles.instructionText}>
            • Instant: Payments are processed immediately
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 50,
  },
  title: {fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.text, fontWeight: 'bold'},
  content: {flex: 1, padding: SPACING.lg, alignItems: 'center'},
  nfcIconContainer: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.xxl,
    ...SHADOWS.large,
  },
  status: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  instructions: {
    width: '100%',
  },
  instructionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});

export default NFCPayScreen;
