import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import aptosService from '@/services/aptosService';
import {useAppStore} from '@/store';

const SendScreen = ({navigation, route}: any) => {
  const [recipient, setRecipient] = useState(route?.params?.recipient || '');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const {wallet, addTransaction, updateXP} = useAppStore();

  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(recipient)) {
      Alert.alert('Error', 'Invalid address format');
      return;
    }

    setLoading(true);
    try {
      const txHash = await aptosService.transfer(
        wallet.privateKey!,
        recipient,
        parseFloat(amount)
      );

      addTransaction({
        hash: txHash,
        type: 'send',
        from: wallet.address!,
        to: recipient,
        amount: parseFloat(amount),
        token: 'APT',
        timestamp: Date.now(),
        status: 'success',
      });

      updateXP(20);
      
      Alert.alert('Success!', `Sent ${amount} APT\nTx: ${txHash.slice(0, 10)}...`, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Send Money</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('QRScanner')}>
            <LinearGradient colors={COLORS.gradientBlue} style={styles.quickActionBtn}>
              <Icon name="qr-code" size={24} color={COLORS.text} />
            </LinearGradient>
            <Text style={styles.quickActionText}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('NFCPay')}>
            <LinearGradient colors={COLORS.gradientGold} style={styles.quickActionBtn}>
              <Icon name="phone-portrait" size={24} color={COLORS.text} />
            </LinearGradient>
            <Text style={styles.quickActionText}>Tap to Pay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Recipient Address</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="0x..."
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Amount (APT)</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={[styles.input, {flex: 1}]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad"
            />
            <Text style={styles.usdValue}>
              ≈ ${(parseFloat(amount || '0') * 8.42).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.maxButton}
            onPress={() => setAmount((wallet.balance / 100000000 - 0.01).toFixed(2))}>
            <Text style={styles.maxText}>Max: {(wallet.balance / 100000000).toFixed(4)} APT</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Memo (Optional)</Text>
          <TextInput
            style={styles.input}
            value={memo}
            onChangeText={setMemo}
            placeholder="Add a note..."
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <TouchableOpacity onPress={handleSend} disabled={loading}>
          <LinearGradient colors={COLORS.gradientPurple} style={styles.sendButton}>
            {loading ? (
              <Text style={styles.sendText}>Sending...</Text>
            ) : (
              <Text style={styles.sendText}>Send {amount || '0'} APT</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
  content: {flex: 1, padding: SPACING.lg},
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  quickAction: {alignItems: 'center'},
  quickActionBtn: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  form: {marginBottom: SPACING.xl},
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  usdValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  maxButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  maxText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
  },
  sendButton: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  sendText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default SendScreen;
