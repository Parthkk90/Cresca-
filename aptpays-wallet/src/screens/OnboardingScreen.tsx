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
import {useAppStore} from '@/store';
import aptosService from '@/services/aptosService';

const OnboardingScreen = ({navigation}: any) => {
  const [mode, setMode] = useState<'import' | 'create'>('create');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const {setWallet} = useAppStore();

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      const wallet = await aptosService.createWallet();
      
      setWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: 0,
        isConnected: true,
      });

      Alert.alert(
        'Wallet Created!',
        'Your new wallet has been created. Please save your private key securely.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.replace('AvatarSelection'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey || privateKey.length !== 66) {
      Alert.alert('Error', 'Please enter a valid 64-character private key (0x...)');
      return;
    }

    setLoading(true);
    try {
      // Derive address from private key
      const {Aptos, AptosConfig, Network, Account} = require('aptos');
      const config = new AptosConfig({network: Network.TESTNET});
      const aptos = new Aptos(config);
      const account = Account.fromPrivateKey({privateKey});

      const balance = await aptos.getAccountAPTAmount({
        accountAddress: account.accountAddress,
      });

      setWallet({
        address: account.accountAddress.toString(),
        privateKey: privateKey,
        balance: balance,
        isConnected: true,
      });

      Alert.alert('Success!', 'Wallet imported successfully', [
        {
          text: 'Continue',
          onPress: () => navigation.replace('AvatarSelection'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to import wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>Welcome to AptPays</Text>
        <Text style={styles.subtitle}>
          Your super wallet for Aptos blockchain
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'create' && styles.modeBtnActive]}
            onPress={() => setMode('create')}>
            <Icon
              name="add-circle"
              size={24}
              color={mode === 'create' ? COLORS.text : COLORS.textSecondary}
            />
            <Text
              style={[styles.modeText, mode === 'create' && styles.modeTextActive]}>
              Create New
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === 'import' && styles.modeBtnActive]}
            onPress={() => setMode('import')}>
            <Icon
              name="download"
              size={24}
              color={mode === 'import' ? COLORS.text : COLORS.textSecondary}
            />
            <Text
              style={[styles.modeText, mode === 'import' && styles.modeTextActive]}>
              Import Existing
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <View style={styles.section}>
            <View style={styles.featureCard}>
              <Icon name="shield-checkmark" size={32} color={COLORS.success} />
              <Text style={styles.featureTitle}>Secure Storage</Text>
              <Text style={styles.featureText}>
                Your private keys are encrypted and stored securely on your device
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Icon name="flash" size={32} color={COLORS.warning} />
              <Text style={styles.featureTitle}>Instant Payments</Text>
              <Text style={styles.featureText}>
                Send and receive APT with NFC tap-to-pay and QR codes
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Icon name="rocket" size={32} color={COLORS.primary} />
              <Text style={styles.featureTitle}>DeFi & Investing</Text>
              <Text style={styles.featureText}>
                Access token swaps, investment bundles, and scheduled payments
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCreateWallet}
              disabled={loading}>
              <LinearGradient
                colors={COLORS.gradientPurple}
                style={styles.actionButton}>
                <Text style={styles.actionText}>
                  {loading ? 'Creating Wallet...' : 'Create My Wallet'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.label}>Private Key</Text>
            <TextInput
              style={styles.input}
              value={privateKey}
              onChangeText={setPrivateKey}
              placeholder="0x..."
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              multiline
            />

            <View style={styles.warningCard}>
              <Icon name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Never share your private key with anyone. We will never ask for it.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleImportWallet}
              disabled={loading}>
              <LinearGradient
                colors={COLORS.gradientBlue}
                style={styles.actionButton}>
                <Text style={styles.actionText}>
                  {loading ? 'Importing...' : 'Import Wallet'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.xxl,
  },
  logo: {fontSize: 80, marginBottom: SPACING.md},
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text + 'CC',
    marginTop: SPACING.xs,
  },
  content: {flex: 1, padding: SPACING.lg},
  modeSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modeTextActive: {
    color: COLORS.text,
  },
  section: {marginBottom: SPACING.xl},
  featureCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  terms: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default OnboardingScreen;
