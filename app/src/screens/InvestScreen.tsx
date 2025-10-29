import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS} from '@/theme';
import {useAppStore} from '@/store';

const InvestScreen = ({navigation}: any) => {
  const {updateXP, addTransaction, wallet} = useAppStore();

  const bundles = [
    {
      id: 1,
      name: 'DeFi Blue Chip',
      description: 'Top DeFi protocols with proven track records',
      apy: 12.5,
      risk: 'Medium',
      tokens: ['APT', 'USDC', 'wETH'],
      allocation: [40, 30, 30],
      minInvestment: 10,
      totalStaked: 1250000,
      color: COLORS.gradientBlue,
    },
    {
      id: 2,
      name: 'Stablecoin Farm',
      description: 'Low risk yield farming with stablecoins',
      apy: 8.2,
      risk: 'Low',
      tokens: ['USDC', 'USDT', 'DAI'],
      allocation: [50, 30, 20],
      minInvestment: 5,
      totalStaked: 3400000,
      color: COLORS.gradientGreen,
    },
    {
      id: 3,
      name: 'High Growth',
      description: 'Emerging protocols with high growth potential',
      apy: 28.7,
      risk: 'High',
      tokens: ['APT', 'NEW', 'GROW'],
      allocation: [60, 25, 15],
      minInvestment: 20,
      totalStaked: 580000,
      color: COLORS.gradientPurple,
    },
    {
      id: 4,
      name: 'NFT Index',
      description: 'Diversified NFT collection exposure',
      apy: 15.3,
      risk: 'Medium',
      tokens: ['NFT', 'APT', 'USDC'],
      allocation: [50, 30, 20],
      minInvestment: 15,
      totalStaked: 920000,
      color: COLORS.gradientGold,
    },
  ];

  const handleInvest = (bundle: typeof bundles[0]) => {
    Alert.alert(
      `Invest in ${bundle.name}`,
      `Minimum: ${bundle.minInvestment} APT\nAPY: ${bundle.apy}%\nRisk: ${bundle.risk}`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Invest',
          onPress: () => {
            // Simulate investment
            addTransaction({
              hash: '0x' + Math.random().toString(16).substring(2),
              type: 'invest',
              from: wallet.address!,
              to: 'Bundle Contract',
              amount: bundle.minInvestment,
              token: bundle.name,
              timestamp: Date.now(),
              status: 'success',
            });
            updateXP(40);
            Alert.alert('Success!', `Invested ${bundle.minInvestment} APT in ${bundle.name}`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Investment Bundles</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statValue}>$0.00</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Yield</Text>
            <Text style={[styles.statValue, {color: COLORS.success}]}>+$0.00</Text>
          </View>
        </View>

        {/* Bundles */}
        <Text style={styles.sectionTitle}>Available Bundles</Text>
        {bundles.map((bundle) => (
          <TouchableOpacity
            key={bundle.id}
            style={styles.bundleCard}
            onPress={() => handleInvest(bundle)}>
            <LinearGradient
              colors={bundle.color}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.bundleGradient}>
              <View style={styles.bundleHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.bundleName}>{bundle.name}</Text>
                  <Text style={styles.bundleDesc}>{bundle.description}</Text>
                </View>
                <View style={styles.apyBadge}>
                  <Text style={styles.apyText}>{bundle.apy}%</Text>
                  <Text style={styles.apyLabel}>APY</Text>
                </View>
              </View>

              <View style={styles.bundleDetails}>
                <View style={styles.detailItem}>
                  <Icon name="shield" size={16} color={COLORS.text} />
                  <Text style={styles.detailText}>Risk: {bundle.risk}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="cash" size={16} color={COLORS.text} />
                  <Text style={styles.detailText}>Min: {bundle.minInvestment} APT</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="people" size={16} color={COLORS.text} />
                  <Text style={styles.detailText}>
                    ${(bundle.totalStaked / 1000).toFixed(0)}K staked
                  </Text>
                </View>
              </View>

              <View style={styles.allocationRow}>
                {bundle.tokens.map((token, idx) => (
                  <View key={idx} style={styles.allocationItem}>
                    <Text style={styles.allocationToken}>{token}</Text>
                    <Text style={styles.allocationPercent}>{bundle.allocation[idx]}%</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.investButton}>
                <Text style={styles.investText}>Invest Now</Text>
                <Icon name="arrow-forward" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Info */}
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Investment bundles are automatically rebalanced and optimized for maximum returns.
            APY rates are variable and depend on market conditions.
          </Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  statLabel: {fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary},
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  bundleCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  bundleGradient: {
    padding: SPACING.lg,
  },
  bundleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  bundleName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  bundleDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text + 'CC',
    marginTop: 4,
  },
  apyBadge: {
    backgroundColor: COLORS.background + '80',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  apyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  apyLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  bundleDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.text},
  allocationRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  allocationItem: {
    backgroundColor: COLORS.background + '80',
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  allocationToken: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  allocationPercent: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  investButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background + '80',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  investText: {
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
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default InvestScreen;
