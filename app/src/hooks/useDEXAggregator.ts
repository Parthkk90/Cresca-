import { useState, useCallback } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const ADMIN_ADDRESS = '0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b';
const DEX_MODULE = `${ADMIN_ADDRESS}::dex_aggregator`;

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

interface AggregatorStats {
  total_volume: string;
  total_swaps: string;
  fees_collected: string;
}

interface PriceComparison {
  best_dex_id: number;
  best_output: string;
  worst_output: string;
  price_diff_bps: string;
}

export const useDEXAggregator = () => {
  const [aptos] = useState(() => {
    const config = new AptosConfig({ network: Network.TESTNET });
    return new Aptos(config);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all supported DEXs with their stats
   */
  const getSupportedDexs = useCallback(async (): Promise<DEXInfo[]> => {
    try {
      setLoading(true);
      setError(null);

      const result = await aptos.view({
        payload: {
          function: `${DEX_MODULE}::get_supported_dexs`,
          typeArguments: [],
          functionArguments: [ADMIN_ADDRESS],
        },
      });

      return (result[0] || []) as DEXInfo[];
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch supported DEXs';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [aptos]);

  /**
   * Get aggregator statistics
   */
  const getAggregatorStats = useCallback(async (): Promise<AggregatorStats> => {
    try {
      setLoading(true);
      setError(null);

      const result = await aptos.view({
        payload: {
          function: `${DEX_MODULE}::get_aggregator_stats`,
          typeArguments: [],
          functionArguments: [ADMIN_ADDRESS],
        },
      });

      return {
        total_volume: result[0] as string,
        total_swaps: result[1] as string,
        fees_collected: result[2] as string,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch aggregator stats';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [aptos]);

  /**
   * Get stats for a specific DEX
   */
  const getDexStats = useCallback(
    async (dexId: number): Promise<{ volume: string; swaps: string; enabled: boolean }> => {
      try {
        setLoading(true);
        setError(null);

        const result = await aptos.view({
          payload: {
            function: `${DEX_MODULE}::get_dex_stats`,
            typeArguments: [],
            functionArguments: [ADMIN_ADDRESS, dexId.toString()],
          },
        });

        return {
          volume: result[0] as string,
          swaps: result[1] as string,
          enabled: result[2] as boolean,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch DEX stats';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [aptos]
  );

  /**
   * Find the best route for a swap
   */
  const findBestRoute = useCallback(
    async (
      tokenInType: string,
      tokenOutType: string,
      amountIn: number
    ): Promise<{ dex_id: number; amount_out: string; price_impact: string }> => {
      try {
        setLoading(true);
        setError(null);

        // Convert to smallest unit (8 decimals for APT)
        const amountInOctas = Math.floor(amountIn * 100000000);

        const result = await aptos.view({
          payload: {
            function: `${DEX_MODULE}::find_best_route`,
            typeArguments: [tokenInType, tokenOutType],
            functionArguments: [ADMIN_ADDRESS, amountInOctas.toString()],
          },
        });

        return {
          dex_id: result[0] as number,
          amount_out: result[1] as string,
          price_impact: result[2] as string,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to find best route';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [aptos]
  );

  /**
   * Get all available routes for a swap
   */
  const getAllRoutes = useCallback(
    async (tokenInType: string, tokenOutType: string, amountIn: number): Promise<SwapRoute[]> => {
      try {
        setLoading(true);
        setError(null);

        const amountInOctas = Math.floor(amountIn * 100000000);

        const result = await aptos.view({
          payload: {
            function: `${DEX_MODULE}::get_all_routes`,
            typeArguments: [tokenInType, tokenOutType],
            functionArguments: [ADMIN_ADDRESS, amountInOctas.toString()],
          },
        });

        return (result[0] || []) as SwapRoute[];
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get all routes';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [aptos]
  );

  /**
   * Compare prices across all DEXs
   */
  const comparePrices = useCallback(
    async (tokenInType: string, tokenOutType: string, amountIn: number): Promise<PriceComparison> => {
      try {
        setLoading(true);
        setError(null);

        const amountInOctas = Math.floor(amountIn * 100000000);

        const result = await aptos.view({
          payload: {
            function: `${DEX_MODULE}::compare_prices`,
            typeArguments: [tokenInType, tokenOutType],
            functionArguments: [ADMIN_ADDRESS, amountInOctas.toString()],
          },
        });

        return {
          best_dex_id: result[0] as number,
          best_output: result[1] as string,
          worst_output: result[2] as string,
          price_diff_bps: result[3] as string,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to compare prices';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [aptos]
  );

  /**
   * Format amount from smallest unit to decimal
   */
  const formatAmount = useCallback((amount: string, decimals: number = 8): string => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toFixed(6);
  }, []);

  /**
   * Format basis points to percentage
   */
  const formatBps = useCallback((bps: string): string => {
    return (parseFloat(bps) / 100).toFixed(2);
  }, []);

  /**
   * Calculate minimum output with slippage
   */
  const calculateMinOutput = useCallback((expectedOutput: string, slippagePercent: number): string => {
    const output = parseFloat(expectedOutput);
    const slippageBps = slippagePercent * 100;
    const minOutput = Math.floor(output * (10000 - slippageBps) / 10000);
    return minOutput.toString();
  }, []);

  return {
    // State
    loading,
    error,

    // Read functions
    getSupportedDexs,
    getAggregatorStats,
    getDexStats,
    findBestRoute,
    getAllRoutes,
    comparePrices,

    // Utility functions
    formatAmount,
    formatBps,
    calculateMinOutput,

    // Aptos instance (for wallet integrations)
    aptos,
  };
};

export default useDEXAggregator;
