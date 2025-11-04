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

const SwapScreen = ({navigation}: any) => {
  const {wallet, tokens, updateXP, addTransaction} = useAppStore();
  const [fromToken, setFromToken] = useState('APT');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const tokenList = [
    {symbol: 'APT', name: 'Aptos', price: 8.42},
    {symbol: 'USDC', name: 'USD Coin', price: 1.0},
    {symbol: 'USDT', name: 'Tether', price: 1.0},
    {symbol: 'wETH', name: 'Wrapped Ethereum', price: 2340.0},
    {symbol: 'wBTC', name: 'Wrapped Bitcoin', price: 43200.0},
  ];

  const calculateSwap = (amount: string, from: string, to: string) => {
    const fromPrice = tokenList.find((t) => t.symbol === from)?.price || 1;
    const toPrice = tokenList.find((t) => t.symbol === to)?.price || 1;
    const result = (parseFloat(amount) * fromPrice) / toPrice;
    return result.toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      setToAmount(calculateSwap(value, fromToken, toToken));
    } else {
      setToAmount('');
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Simulated swap - integrate with real DEX aggregator
      await new Promise((resolve) => setTimeout(resolve, 2000));

      addTransaction({
        hash: '0x' + Math.random().toString(16).substring(2),
        type: 'swap',
        from: wallet.address!,
        to: wallet.address!,
        amount: parseFloat(fromAmount),
        token: `${fromToken}->${toToken}`,
        timestamp: Date.now(),
        status: 'success',
      });

      updateXP(30);

      Alert.alert(
        'Swap Successful!',
        `Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
        [{text: 'OK', onPress: () => navigation.navigate('Home')}]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    if (fromAmount) {
      setToAmount(fromAmount);
      setFromAmount(toAmount);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Token Swap</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* From Token */}
        <View style={styles.swapCard}>
          <Text style={styles.label}>From</Text>
          <View style={styles.tokenRow}>
            <TouchableOpacity style={styles.tokenSelector}>
              <Text style={styles.tokenSymbol}>{fromToken}</Text>
              <Icon name="chevron-down" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TextInput
              style={styles.amountInput}
              value={fromAmount}
              onChangeText={handleFromAmountChange}
              placeholder="0.0"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.balance}>
            Balance: {(wallet.balance / 100000000).toFixed(4)} {fromToken}
          </Text>
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapButton} onPress={swapTokens}>
          <LinearGradient colors={COLORS.gradientPurple} style={styles.swapIcon}>
            <Icon name="swap-vertical" size={24} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>

        {/* To Token */}
        <View style={styles.swapCard}>
          <Text style={styles.label}>To</Text>
          <View style={styles.tokenRow}>
            <TouchableOpacity style={styles.tokenSelector}>
              <Text style={styles.tokenSymbol}>{toToken}</Text>
              <Icon name="chevron-down" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.amountInput}>{toAmount || '0.0'}</Text>
          </View>
          <Text style={styles.balance}>
            Estimated: ${(parseFloat(toAmount || '0') * (tokenList.find((t) => t.symbol === toToken)?.price || 1)).toFixed(2)}
          </Text>
        </View>

        {/* Swap Details */}
        {fromAmount && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rate</Text>
              <Text style={styles.detailValue}>
                1 {fromToken} = {calculateSwap('1', fromToken, toToken)} {toToken}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee (0.3%)</Text>
              <Text style={styles.detailValue}>
                {(parseFloat(fromAmount) * 0.003).toFixed(4)} {fromToken}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slippage</Text>
              <Text style={styles.detailValue}>0.5%</Text>
            </View>
          </View>
        )}

        {/* Execute Button */}
        <TouchableOpacity onPress={handleSwap} disabled={loading || !fromAmount}>
          <LinearGradient
            colors={!fromAmount ? [COLORS.surface, COLORS.surface] : COLORS.gradientGreen}
            style={styles.executeButton}>
            <Text style={styles.executeText}>
              {loading ? 'Swapping...' : 'Swap Now'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Popular Pairs */}
        <Text style={styles.sectionTitle}>Popular Pairs</Text>
        <View style={styles.pairsGrid}>
          {[
            ['APT', 'USDC'],
            ['APT', 'wETH'],
            ['USDC', 'USDT'],
            ['wBTC', 'wETH'],
          ].map((pair, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.pairCard}
              onPress={() => {
                setFromToken(pair[0]);
                setToToken(pair[1]);
              }}>
              <Text style={styles.pairText}>
                {pair[0]}/{pair[1]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: SPACING.lg, paddingTop: 50},
  title: {fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.text, fontWeight: 'bold'},
  content: {flex: 1, padding: SPACING.lg},
  swapCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  label: {fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginBottom: 8},
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  tokenSymbol: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  amountInput: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  balance: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  swapButton: {
    alignSelf: 'center',
    marginVertical: -SPACING.md,
    zIndex: 1,
  },
  swapIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary},
  detailValue: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text},
  executeButton: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  executeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  pairsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pairCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
  },
  pairText: {fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text},
});

export default SwapScreen;
