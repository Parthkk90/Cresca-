import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// DEX Aggregator Configuration
const ADMIN_ADDRESS = '0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b';
const DEX_MODULE = `${ADMIN_ADDRESS}::dex_aggregator`;

// DEX IDs
const DEX_IDS = {
  LIQUIDSWAP: 1,
  PANORA: 2,
  THALA: 3,
  CETUS: 4,
  CELLANA: 5,
};

const DEX_NAMES = {
  1: 'Liquidswap',
  2: 'Panora',
  3: 'Thala',
  4: 'Cetus',
  5: 'Cellana',
};

interface SwapRoute {
  dex_id: number;
  dex_name: string;
  amount_in: string;
  amount_out: string;
  price_impact: string;
  estimated_fee: string;
}

interface DEXInfo {
  dex_id: number;
  name: string;
  enabled: boolean;
  total_volume: string;
  swap_count: string;
}

const DEXAggregatorScreen: React.FC = () => {
  const [aptos, setAptos] = useState<Aptos | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [amountIn, setAmountIn] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState('1.0');
  const [selectedDex, setSelectedDex] = useState<number | null>(null);
  
  // Routes and comparison
  const [allRoutes, setAllRoutes] = useState<SwapRoute[]>([]);
  const [bestRoute, setBestRoute] = useState<{
    dex_id: number;
    amount_out: string;
    price_impact: string;
  } | null>(null);
  const [priceComparison, setPriceComparison] = useState<{
    best_dex_id: number;
    best_output: string;
    worst_output: string;
    price_diff_bps: string;
  } | null>(null);
  
  // DEX stats
  const [supportedDexs, setSupportedDexs] = useState<DEXInfo[]>([]);
  const [aggregatorStats, setAggregatorStats] = useState<{
    total_volume: string;
    total_swaps: string;
    fees_collected: string;
  } | null>(null);

  // Initialize Aptos SDK
  useEffect(() => {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptosClient = new Aptos(config);
    setAptos(aptosClient);
    
    loadInitialData(aptosClient);
  }, []);

  const loadInitialData = async (aptosClient: Aptos) => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchSupportedDexs(aptosClient),
        fetchAggregatorStats(aptosClient),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchSupportedDexs = async (aptosClient?: Aptos) => {
    try {
      const client = aptosClient || aptos;
      if (!client) return;

      const result = await client.view({
        payload: {
          function: `${DEX_MODULE}::get_supported_dexs`,
          typeArguments: [],
          functionArguments: [ADMIN_ADDRESS],
        },
      });

      if (result && result[0]) {
        setSupportedDexs(result[0] as DEXInfo[]);
      }
    } catch (error) {
      console.error('Error fetching supported DEXs:', error);
    }
  };

  const fetchAggregatorStats = async (aptosClient?: Aptos) => {
    try {
      const client = aptosClient || aptos;
      if (!client) return;

      const result = await client.view({
        payload: {
          function: `${DEX_MODULE}::get_aggregator_stats`,
          typeArguments: [],
          functionArguments: [ADMIN_ADDRESS],
        },
      });

      if (result && result.length >= 3) {
        setAggregatorStats({
          total_volume: result[0] as string,
          total_swaps: result[1] as string,
          fees_collected: result[2] as string,
        });
      }
    } catch (error) {
      console.error('Error fetching aggregator stats:', error);
    }
  };

  const fetchAllRoutes = async () => {
    if (!aptos || !amountIn || parseFloat(amountIn) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      // Convert amount to smallest unit (assuming 8 decimals for APT)
      const amountInOctas = Math.floor(parseFloat(amountIn) * 100000000);

      const result = await aptos.view({
        payload: {
          function: `${DEX_MODULE}::get_all_routes`,
          typeArguments: [
            '0x1::aptos_coin::AptosCoin',
            '0x1::aptos_coin::AptosCoin', // Replace with actual USDC type
          ],
          functionArguments: [ADMIN_ADDRESS, amountInOctas.toString()],
        },
      });

      if (result && result[0]) {
        const routes = result[0] as SwapRoute[];
        setAllRoutes(routes);
        
        // Find best route
        if (routes.length > 0) {
          const best = routes.reduce((prev, current) => 
            parseFloat(current.amount_out) > parseFloat(prev.amount_out) ? current : prev
          );
          setBestRoute({
            dex_id: best.dex_id,
            amount_out: best.amount_out,
            price_impact: best.price_impact,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Failed to fetch routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const comparePrices = async () => {
    if (!aptos || !amountIn || parseFloat(amountIn) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      const amountInOctas = Math.floor(parseFloat(amountIn) * 100000000);

      const result = await aptos.view({
        payload: {
          function: `${DEX_MODULE}::compare_prices`,
          typeArguments: [
            '0x1::aptos_coin::AptosCoin',
            '0x1::aptos_coin::AptosCoin',
          ],
          functionArguments: [ADMIN_ADDRESS, amountInOctas.toString()],
        },
      });

      if (result && result.length >= 4) {
        setPriceComparison({
          best_dex_id: result[0] as number,
          best_output: result[1] as string,
          worst_output: result[2] as string,
          price_diff_bps: result[3] as string,
        });
      }
    } catch (error) {
      console.error('Error comparing prices:', error);
      Alert.alert('Error', 'Failed to compare prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async (useBestRoute: boolean) => {
    if (!aptos || !amountIn || parseFloat(amountIn) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount');
      return;
    }

    if (!useBestRoute && !selectedDex) {
      Alert.alert('No DEX Selected', 'Please select a DEX for swap');
      return;
    }

    try {
      setLoading(true);
      
      const amountInOctas = Math.floor(parseFloat(amountIn) * 100000000);
      const slippageBps = Math.floor(parseFloat(slippageTolerance) * 100);
      const minAmountOut = bestRoute 
        ? Math.floor(parseFloat(bestRoute.amount_out) * (10000 - slippageBps) / 10000)
        : 0;

      // NOTE: This requires wallet integration (Petra, Martian, etc.)
      // For now, showing alert that this would execute the swap
      
      Alert.alert(
        'Swap Preview',
        `Swap ${amountIn} APT\n` +
        `Via: ${useBestRoute ? DEX_NAMES[bestRoute?.dex_id || 1] : DEX_NAMES[selectedDex || 1]}\n` +
        `Min Output: ${(minAmountOut / 100000000).toFixed(6)} APT\n` +
        `Slippage: ${slippageTolerance}%\n\n` +
        'Wallet integration required for execution',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Execute',
            onPress: () => {
              // TODO: Integrate wallet SDK
              Alert.alert('Info', 'Connect wallet to execute swap');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error executing swap:', error);
      Alert.alert('Error', 'Failed to execute swap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string, decimals: number = 8): string => {
    return (parseFloat(amount) / Math.pow(10, decimals)).toFixed(6);
  };

  const formatBps = (bps: string): string => {
    return (parseFloat(bps) / 100).toFixed(2);
  };

  const onRefresh = async () => {
    if (aptos) {
      await loadInitialData(aptos);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DEX Aggregator</Text>
        <Text style={styles.headerSubtitle}>Find Best Prices Across 5 DEXs</Text>
      </View>

      {/* Aggregator Stats */}
      {aggregatorStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Volume</Text>
            <Text style={styles.statValue}>
              {formatAmount(aggregatorStats.total_volume)} APT
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Swaps</Text>
            <Text style={styles.statValue}>{aggregatorStats.total_swaps}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fees Collected</Text>
            <Text style={styles.statValue}>
              {formatAmount(aggregatorStats.fees_collected)} APT
            </Text>
          </View>
        </View>
      )}

      {/* Swap Input Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Swap Amount</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount (APT)</Text>
          <TextInput
            style={styles.input}
            value={amountIn}
            onChangeText={setAmountIn}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Slippage Tolerance (%)</Text>
          <TextInput
            style={styles.input}
            value={slippageTolerance}
            onChangeText={setSlippageTolerance}
            placeholder="1.0"
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={fetchAllRoutes}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Find All Routes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={comparePrices}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Compare Prices</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Best Route Display */}
      {bestRoute && (
        <View style={styles.bestRouteContainer}>
          <Text style={styles.sectionTitle}>🏆 Best Route</Text>
          <View style={styles.bestRouteCard}>
            <Text style={styles.bestRouteDex}>
              {DEX_NAMES[bestRoute.dex_id]}
            </Text>
            <Text style={styles.bestRouteAmount}>
              Output: {formatAmount(bestRoute.amount_out)} APT
            </Text>
            <Text style={styles.bestRouteImpact}>
              Price Impact: {formatBps(bestRoute.price_impact)}%
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, styles.swapButton]}
              onPress={() => executeSwap(true)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                Swap via {DEX_NAMES[bestRoute.dex_id]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Price Comparison */}
      {priceComparison && (
        <View style={styles.comparisonContainer}>
          <Text style={styles.sectionTitle}>📊 Price Comparison</Text>
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Best DEX:</Text>
              <Text style={styles.comparisonValue}>
                {DEX_NAMES[priceComparison.best_dex_id]}
              </Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Best Output:</Text>
              <Text style={styles.comparisonValue}>
                {formatAmount(priceComparison.best_output)} APT
              </Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Worst Output:</Text>
              <Text style={styles.comparisonValue}>
                {formatAmount(priceComparison.worst_output)} APT
              </Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Price Difference:</Text>
              <Text style={[styles.comparisonValue, styles.priceDiff]}>
                {formatBps(priceComparison.price_diff_bps)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* All Routes List */}
      {allRoutes.length > 0 && (
        <View style={styles.routesContainer}>
          <Text style={styles.sectionTitle}>All Available Routes</Text>
          {allRoutes.map((route, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.routeCard,
                selectedDex === route.dex_id && styles.routeCardSelected,
              ]}
              onPress={() => setSelectedDex(route.dex_id)}
            >
              <View style={styles.routeHeader}>
                <Text style={styles.routeDexName}>{route.dex_name}</Text>
                {selectedDex === route.dex_id && (
                  <Text style={styles.selectedBadge}>✓ Selected</Text>
                )}
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Output:</Text>
                <Text style={styles.routeValue}>
                  {formatAmount(route.amount_out)} APT
                </Text>
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Price Impact:</Text>
                <Text style={styles.routeValue}>
                  {formatBps(route.price_impact)}%
                </Text>
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Aggregator Fee:</Text>
                <Text style={styles.routeValue}>
                  {formatAmount(route.estimated_fee)} APT
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {selectedDex && (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, styles.swapButton]}
              onPress={() => executeSwap(false)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                Swap via {DEX_NAMES[selectedDex]}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Supported DEXs */}
      {supportedDexs.length > 0 && (
        <View style={styles.dexListContainer}>
          <Text style={styles.sectionTitle}>Supported DEXs</Text>
          {supportedDexs.map((dex, index) => (
            <View key={index} style={styles.dexCard}>
              <View style={styles.dexHeader}>
                <Text style={styles.dexName}>{dex.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    dex.enabled ? styles.statusEnabled : styles.statusDisabled,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {dex.enabled ? 'Active' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <View style={styles.dexStats}>
                <Text style={styles.dexStatLabel}>
                  Volume: {formatAmount(dex.total_volume)} APT
                </Text>
                <Text style={styles.dexStatLabel}>
                  Swaps: {dex.swap_count}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Info Footer */}
      <View style={styles.infoFooter}>
        <Text style={styles.infoText}>
          💡 The aggregator automatically finds the best price across all DEXs
        </Text>
        <Text style={styles.infoText}>
          🔒 Aggregator Fee: 0.05% (5 basis points)
        </Text>
        <Text style={styles.infoText}>
          ⚡ Slippage protection included in all swaps
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1f35',
    borderBottomWidth: 1,
    borderBottomColor: '#2a3550',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8892b0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1a1f35',
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#8892b0',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64ffda',
  },
  formContainer: {
    padding: 15,
    backgroundColor: '#1a1f35',
    margin: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8892b0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0a0e1a',
    borderWidth: 1,
    borderColor: '#2a3550',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#64ffda',
  },
  buttonSecondary: {
    backgroundColor: '#5a67d8',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a0e1a',
  },
  swapButton: {
    marginTop: 15,
  },
  bestRouteContainer: {
    padding: 15,
  },
  bestRouteCard: {
    backgroundColor: '#1a1f35',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64ffda',
  },
  bestRouteDex: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 10,
  },
  bestRouteAmount: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  bestRouteImpact: {
    fontSize: 14,
    color: '#8892b0',
  },
  comparisonContainer: {
    padding: 15,
  },
  comparisonCard: {
    backgroundColor: '#1a1f35',
    padding: 15,
    borderRadius: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3550',
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#8892b0',
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceDiff: {
    color: '#64ffda',
  },
  routesContainer: {
    padding: 15,
  },
  routeCard: {
    backgroundColor: '#1a1f35',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#2a3550',
  },
  routeCardSelected: {
    borderColor: '#64ffda',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeDexName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedBadge: {
    fontSize: 12,
    color: '#64ffda',
    fontWeight: 'bold',
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  routeLabel: {
    fontSize: 13,
    color: '#8892b0',
  },
  routeValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  dexListContainer: {
    padding: 15,
  },
  dexCard: {
    backgroundColor: '#1a1f35',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  dexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dexName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusEnabled: {
    backgroundColor: '#10b981',
  },
  statusDisabled: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  dexStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dexStatLabel: {
    fontSize: 12,
    color: '#8892b0',
  },
  infoFooter: {
    padding: 20,
    backgroundColor: '#1a1f35',
    margin: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 13,
    color: '#8892b0',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default DEXAggregatorScreen;
