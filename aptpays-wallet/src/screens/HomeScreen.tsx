import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS} from '@/theme';

const {width} = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const balance = 125.48; // Mock balance in APT
  const balanceUSD = balance * 8.42; // Mock price

  const quickActions = [
    {
      id: 'send',
      title: 'Send',
      icon: 'send',
      gradient: COLORS.gradientPurple,
      onPress: () => navigation.navigate('Send'),
    },
    {
      id: 'receive',
      title: 'Receive',
      icon: 'download',
      gradient: COLORS.gradientGreen,
      onPress: () => navigation.navigate('Receive'),
    },
    {
      id: 'qr',
      title: 'QR Code',
      icon: 'qr-code',
      gradient: COLORS.gradientBlue,
      onPress: () => navigation.navigate('QRScanner'),
    },
    {
      id: 'nfc',
      title: 'Tap to Pay',
      icon: 'phone-portrait',
      gradient: COLORS.gradientGold,
      onPress: () => navigation.navigate('NFCPay'),
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'receive',
      from: '0x25714...91eda4',
      amount: 5.2,
      timestamp: Date.now() - 3600000,
      status: 'success',
    },
    {
      id: '2',
      type: 'send',
      to: '0x840fa...59bd68',
      amount: 2.5,
      timestamp: Date.now() - 7200000,
      status: 'success',
    },
    {
      id: '3',
      type: 'schedule',
      to: '0x2bc65...275a1bf',
      amount: 1.0,
      timestamp: Date.now() - 86400000,
      status: 'pending',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with balance card */}
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.headerGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.avatar}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <Text style={styles.avatarText}>🦊</Text>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>12</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="settings-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} APT</Text>
          <Text style={styles.balanceUSD}>${balanceUSD.toFixed(2)} USD</Text>

          <View style={styles.xpBar}>
            <View style={[styles.xpProgress, {width: '68%'}]} />
          </View>
          <Text style={styles.xpText}>680/1000 XP to Level 13</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={action.onPress}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionButton}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}>
                  <Icon name={action.icon} size={28} color={COLORS.text} />
                </LinearGradient>
                <Text style={styles.actionLabel}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((tx) => (
            <TouchableOpacity key={tx.id} style={styles.transactionItem}>
              <View
                style={[
                  styles.txIcon,
                  {
                    backgroundColor:
                      tx.type === 'receive'
                        ? COLORS.success + '20'
                        : tx.type === 'send'
                        ? COLORS.error + '20'
                        : COLORS.accent + '20',
                  },
                ]}>
                <Icon
                  name={
                    tx.type === 'receive'
                      ? 'arrow-down'
                      : tx.type === 'send'
                      ? 'arrow-up'
                      : 'time'
                  }
                  size={20}
                  color={
                    tx.type === 'receive'
                      ? COLORS.success
                      : tx.type === 'send'
                      ? COLORS.error
                      : COLORS.accent
                  }
                />
              </View>

              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>
                  {tx.type === 'receive' ? 'Received from' : tx.type === 'send' ? 'Sent to' : 'Scheduled for'}
                </Text>
                <Text style={styles.txAddress}>
                  {tx.type === 'receive' ? tx.from : tx.to}
                </Text>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    {
                      color:
                        tx.type === 'receive'
                          ? COLORS.success
                          : tx.type === 'send'
                          ? COLORS.error
                          : COLORS.accent,
                    },
                  ]}>
                  {tx.type === 'receive' ? '+' : '-'}
                  {tx.amount.toFixed(2)} APT
                </Text>
                <Text style={styles.txTime}>{getTimeAgo(tx.timestamp)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievement Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Achievement 🏆</Text>
          <LinearGradient
            colors={COLORS.gradientGold}
            style={styles.achievementCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Text style={styles.achievementTitle}>First Transfer!</Text>
            <Text style={styles.achievementDesc}>
              You completed your first transaction
            </Text>
            <Text style={styles.achievementReward}>+100 XP</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: 28,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.accent,
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    paddingHorizontal: SPACING.lg,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  balanceUSD: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.xs,
  },
  xpProgress: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.round,
  },
  xpText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  seeAllButton: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  txTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  txAddress: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  txTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  achievementCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  achievementTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  achievementDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.md,
  },
  achievementReward: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default HomeScreen;
