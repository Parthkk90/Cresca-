import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Share} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import {useAppStore} from '@/store';

const ReceiveScreen = ({navigation}: any) => {
  const {wallet} = useAppStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Note: Use Clipboard from @react-native-clipboard/clipboard in production
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send APT to: ${wallet.address}`,
        title: 'My Aptos Address',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Receive Money</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={COLORS.gradientPurple}
          style={styles.qrContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={wallet.address || ''}
              size={220}
              backgroundColor={COLORS.text}
              color={COLORS.background}
            />
          </View>
        </LinearGradient>

        <Text style={styles.instruction}>
          Scan this QR code to receive APT
        </Text>

        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Your Address</Text>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
            {wallet.address}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCopy} style={{flex: 1}}>
            <LinearGradient
              colors={copied ? COLORS.gradientGreen : COLORS.gradientBlue}
              style={styles.actionButton}>
              <Icon
                name={copied ? 'checkmark' : 'copy'}
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.actionText}>
                {copied ? 'Copied!' : 'Copy Address'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={{flex: 1}}>
            <LinearGradient colors={COLORS.gradientGold} style={styles.actionButton}>
              <Icon name="share-social" size={20} color={COLORS.text} />
              <Text style={styles.actionText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Icon name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Only send APT (Aptos) to this address. Sending other coins may result in
            permanent loss.
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
  qrContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.large,
  },
  qrWrapper: {
    backgroundColor: COLORS.text,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  instruction: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  addressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default ReceiveScreen;
