import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS} from '@/theme';
import {useAppStore} from '@/store';

const TransactionsScreen = ({navigation}: any) => {
  const {transactions} = useAppStore();
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'swap' | 'invest'>('all');
  const [search, setSearch] = useState('');

  const getIcon = (type: string) => {
    switch (type) {
      case 'send':
        return 'arrow-up';
      case 'receive':
        return 'arrow-down';
      case 'swap':
        return 'swap-horizontal';
      case 'invest':
        return 'trending-up';
      default:
        return 'cash';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'send':
        return COLORS.error;
      case 'receive':
        return COLORS.success;
      case 'swap':
        return COLORS.primary;
      case 'invest':
        return COLORS.warning;
      default:
        return COLORS.text;
    }
  };

  const filteredTransactions = transactions
    .filter((tx) => filter === 'all' || tx.type === filter)
    .filter(
      (tx) =>
        search === '' ||
        tx.hash.toLowerCase().includes(search.toLowerCase()) ||
        tx.to?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const groupByDate = (txs: typeof transactions) => {
    const groups: {[key: string]: typeof transactions} = {};
    txs.forEach((tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  };

  const grouped = groupByDate(filteredTransactions);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by hash or address..."
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {['all', 'send', 'receive', 'swap', 'invest'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f as any)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions */}
      <ScrollView style={styles.content}>
        {Object.entries(grouped).map(([date, txs]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {txs.map((tx) => (
              <TouchableOpacity key={tx.hash} style={styles.txCard}>
                <View style={[styles.txIcon, {backgroundColor: getColor(tx.type) + '20'}]}>
                  <Icon name={getIcon(tx.type)} size={24} color={getColor(tx.type)} />
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txType}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </Text>
                  <Text style={styles.txHash} numberOfLines={1}>
                    {tx.hash}
                  </Text>
                  <Text style={styles.txTime}>
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </Text>
                </View>

                <View style={styles.txAmount}>
                  <Text
                    style={[
                      styles.txAmountText,
                      {color: tx.type === 'receive' ? COLORS.success : COLORS.text},
                    ]}>
                    {tx.type === 'receive' ? '+' : '-'}
                    {tx.amount} {tx.token}
                  </Text>
                  <Text style={styles.txStatus}>
                    {tx.status === 'success' ? '✓ Success' : '⏱ Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: SPACING.lg, paddingTop: 50},
  title: {fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.text, fontWeight: 'bold'},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  filters: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  filterBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  content: {flex: 1, paddingHorizontal: SPACING.lg},
  dateHeader: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  txCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  txInfo: {flex: 1},
  txType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  txHash: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txAmount: {alignItems: 'flex-end'},
  txAmountText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: 'bold',
  },
  txStatus: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});

export default TransactionsScreen;
