// Cresca DEX Aggregator - Find best prices across multiple Aptos DEXs
module cresca::dex_aggregator {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_std::type_info;
    use std::error;

    /// Error codes
    const ENOT_INITIALIZED: u64 = 1;
    const EZERO_AMOUNT: u64 = 2;
    const ENOT_ADMIN: u64 = 3;
    const ENO_ROUTES_FOUND: u64 = 4;
    const ESLIPPAGE_EXCEEDED: u64 = 5;
    const EDEX_NOT_AVAILABLE: u64 = 6;
    const EINVALID_DEX_ID: u64 = 7;

    /// DEX identifiers
    const DEX_LIQUIDSWAP: u8 = 1;
    const DEX_PANORA: u8 = 2;
    const DEX_THALA: u8 = 3;
    const DEX_CETUS: u8 = 4;
    const DEX_CELLANA: u8 = 5;

    /// Swap fee for aggregator (0.05% = 5 basis points)
    const AGGREGATOR_FEE_BPS: u64 = 5;
    const BPS_DENOMINATOR: u64 = 10000;

    /// DEX information
    struct DEXInfo has store, copy, drop {
        dex_id: u8,
        name: String,
        enabled: bool,
        total_volume: u64,
        swap_count: u64,
    }

    /// Route information for a swap
    struct SwapRoute has store, copy, drop {
        dex_id: u8,
        dex_name: String,
        amount_in: u64,
        amount_out: u64,
        price_impact: u64,  // In basis points (100 = 1%)
        estimated_fee: u64,
    }

    /// Global aggregator registry
    struct AggregatorRegistry has key {
        admin: address,
        supported_dexs: vector<DEXInfo>,
        total_aggregated_volume: u64,
        total_swaps: u64,
        fees_collected: u64,
    }

    /// Events
    struct AggregatedSwapEvent has drop, store {
        user: address,
        token_in: String,
        token_out: String,
        amount_in: u64,
        amount_out: u64,
        dex_used: String,
        dex_id: u8,
        price_impact_bps: u64,
        aggregator_fee: u64,
        timestamp: u64,
    }

    struct RouteComparisonEvent has drop, store {
        user: address,
        token_in: String,
        token_out: String,
        amount_in: u64,
        routes_found: u64,
        best_dex: String,
        best_output: u64,
        timestamp: u64,
    }

    struct EventStore has key {
        aggregated_swap_events: EventHandle<AggregatedSwapEvent>,
        route_comparison_events: EventHandle<RouteComparisonEvent>,
    }

    /// Initialize DEX aggregator
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        assert!(!exists<AggregatorRegistry>(admin_addr), error::already_exists(ENOT_INITIALIZED));

        // Initialize supported DEXs
        let supported_dexs = vector::empty<DEXInfo>();
        
        vector::push_back(&mut supported_dexs, DEXInfo {
            dex_id: DEX_LIQUIDSWAP,
            name: string::utf8(b"Liquidswap (Pontem)"),
            enabled: true,
            total_volume: 0,
            swap_count: 0,
        });

        vector::push_back(&mut supported_dexs, DEXInfo {
            dex_id: DEX_PANORA,
            name: string::utf8(b"Panora"),
            enabled: true,
            total_volume: 0,
            swap_count: 0,
        });

        vector::push_back(&mut supported_dexs, DEXInfo {
            dex_id: DEX_THALA,
            name: string::utf8(b"Thala Labs"),
            enabled: true,
            total_volume: 0,
            swap_count: 0,
        });

        vector::push_back(&mut supported_dexs, DEXInfo {
            dex_id: DEX_CETUS,
            name: string::utf8(b"Cetus"),
            enabled: true,
            total_volume: 0,
            swap_count: 0,
        });

        vector::push_back(&mut supported_dexs, DEXInfo {
            dex_id: DEX_CELLANA,
            name: string::utf8(b"Cellana Finance"),
            enabled: true,
            total_volume: 0,
            swap_count: 0,
        });

        move_to(admin, AggregatorRegistry {
            admin: admin_addr,
            supported_dexs,
            total_aggregated_volume: 0,
            total_swaps: 0,
            fees_collected: 0,
        });

        move_to(admin, EventStore {
            aggregated_swap_events: account::new_event_handle<AggregatedSwapEvent>(admin),
            route_comparison_events: account::new_event_handle<RouteComparisonEvent>(admin),
        });
    }

    /// Find best route across all DEXs (View function)
    #[view]
    public fun find_best_route<X, Y>(
        admin_addr: address,
        amount_in: u64,
    ): (u8, u64, u64) acquires AggregatorRegistry {
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));

        let registry = borrow_global<AggregatorRegistry>(admin_addr);
        
        let best_dex_id: u8 = 0;
        let best_amount_out: u64 = 0;
        let best_price_impact: u64 = 0;

        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        
        while (i < len) {
            let dex_info = vector::borrow(&registry.supported_dexs, i);
            
            if (dex_info.enabled) {
                // Get quote from each DEX (placeholder - would call actual DEX contracts)
                let (amount_out, price_impact) = get_dex_quote<X, Y>(
                    dex_info.dex_id, 
                    amount_in,
                    admin_addr
                );
                
                // Compare and select best output
                if (amount_out > best_amount_out) {
                    best_dex_id = dex_info.dex_id;
                    best_amount_out = amount_out;
                    best_price_impact = price_impact;
                };
            };
            
            i = i + 1;
        };

        assert!(best_dex_id > 0, error::not_found(ENO_ROUTES_FOUND));
        
        (best_dex_id, best_amount_out, best_price_impact)
    }

    /// Get all available routes (View function)
    #[view]
    public fun get_all_routes<X, Y>(
        admin_addr: address,
        amount_in: u64,
    ): vector<SwapRoute> acquires AggregatorRegistry {
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));

        let registry = borrow_global<AggregatorRegistry>(admin_addr);
        let routes = vector::empty<SwapRoute>();

        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        
        while (i < len) {
            let dex_info = vector::borrow(&registry.supported_dexs, i);
            
            if (dex_info.enabled) {
                let (amount_out, price_impact) = get_dex_quote<X, Y>(
                    dex_info.dex_id,
                    amount_in,
                    admin_addr
                );
                
                if (amount_out > 0) {
                    let estimated_fee = (amount_in * AGGREGATOR_FEE_BPS) / BPS_DENOMINATOR;
                    
                    vector::push_back(&mut routes, SwapRoute {
                        dex_id: dex_info.dex_id,
                        dex_name: dex_info.name,
                        amount_in,
                        amount_out,
                        price_impact,
                        estimated_fee,
                    });
                };
            };
            
            i = i + 1;
        };

        routes
    }

    /// Execute swap through best DEX
    public entry fun swap_exact_in_best_route<X, Y>(
        user: &signer,
        amount_in: u64,
        min_amount_out: u64,
        admin_addr: address,
    ) acquires AggregatorRegistry, EventStore {
        let user_addr = signer::address_of(user);
        
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));

        // Find best route
        let (best_dex_id, best_amount_out, price_impact) = find_best_route<X, Y>(
            admin_addr,
            amount_in
        );

        // Slippage protection
        assert!(best_amount_out >= min_amount_out, error::invalid_argument(ESLIPPAGE_EXCEEDED));

        // Calculate aggregator fee
        let aggregator_fee = (amount_in * AGGREGATOR_FEE_BPS) / BPS_DENOMINATOR;
        let amount_in_after_fee = amount_in - aggregator_fee;

        // Withdraw tokens from user
        let coin_in = coin::withdraw<X>(user, amount_in);
        
        // Extract aggregator fee
        let fee_coin = coin::extract(&mut coin_in, aggregator_fee);
        coin::deposit(admin_addr, fee_coin);

        // Execute swap through best DEX (placeholder - would route to actual DEX)
        let coin_out = execute_swap_on_dex<X, Y>(
            best_dex_id,
            coin_in,
            amount_in_after_fee,
            admin_addr
        );

        // Deposit output to user
        let actual_amount_out = coin::value(&coin_out);
        coin::deposit(user_addr, coin_out);

        // Update registry
        let registry = borrow_global_mut<AggregatorRegistry>(admin_addr);
        registry.total_aggregated_volume = registry.total_aggregated_volume + amount_in;
        registry.total_swaps = registry.total_swaps + 1;
        registry.fees_collected = registry.fees_collected + aggregator_fee;

        // Update DEX stats
        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        while (i < len) {
            let dex_info = vector::borrow_mut(&mut registry.supported_dexs, i);
            if (dex_info.dex_id == best_dex_id) {
                dex_info.total_volume = dex_info.total_volume + amount_in;
                dex_info.swap_count = dex_info.swap_count + 1;
                break
            };
            i = i + 1;
        };

        // Emit event
        let dex_name = get_dex_name(best_dex_id);
        if (exists<EventStore>(admin_addr)) {
            let event_store = borrow_global_mut<EventStore>(admin_addr);
            event::emit_event(&mut event_store.aggregated_swap_events, AggregatedSwapEvent {
                user: user_addr,
                token_in: type_info::type_name<X>(),
                token_out: type_info::type_name<Y>(),
                amount_in,
                amount_out: actual_amount_out,
                dex_used: dex_name,
                dex_id: best_dex_id,
                price_impact_bps: price_impact,
                aggregator_fee,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Execute swap through specific DEX
    public entry fun swap_exact_in_specific_dex<X, Y>(
        user: &signer,
        dex_id: u8,
        amount_in: u64,
        min_amount_out: u64,
        admin_addr: address,
    ) acquires AggregatorRegistry, EventStore {
        let user_addr = signer::address_of(user);
        
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        assert!(dex_id >= DEX_LIQUIDSWAP && dex_id <= DEX_CELLANA, error::invalid_argument(EINVALID_DEX_ID));

        // Get quote from specific DEX
        let (expected_output, price_impact) = get_dex_quote<X, Y>(dex_id, amount_in, admin_addr);
        assert!(expected_output >= min_amount_out, error::invalid_argument(ESLIPPAGE_EXCEEDED));

        // Calculate aggregator fee
        let aggregator_fee = (amount_in * AGGREGATOR_FEE_BPS) / BPS_DENOMINATOR;
        let amount_in_after_fee = amount_in - aggregator_fee;

        // Withdraw tokens from user
        let coin_in = coin::withdraw<X>(user, amount_in);
        
        // Extract aggregator fee
        let fee_coin = coin::extract(&mut coin_in, aggregator_fee);
        coin::deposit(admin_addr, fee_coin);

        // Execute swap on specific DEX
        let coin_out = execute_swap_on_dex<X, Y>(
            dex_id,
            coin_in,
            amount_in_after_fee,
            admin_addr
        );

        // Deposit output to user
        let actual_amount_out = coin::value(&coin_out);
        coin::deposit(user_addr, coin_out);

        // Update registry
        let registry = borrow_global_mut<AggregatorRegistry>(admin_addr);
        registry.total_aggregated_volume = registry.total_aggregated_volume + amount_in;
        registry.total_swaps = registry.total_swaps + 1;
        registry.fees_collected = registry.fees_collected + aggregator_fee;

        // Update DEX stats
        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        while (i < len) {
            let dex_info = vector::borrow_mut(&mut registry.supported_dexs, i);
            if (dex_info.dex_id == dex_id) {
                dex_info.total_volume = dex_info.total_volume + amount_in;
                dex_info.swap_count = dex_info.swap_count + 1;
                break
            };
            i = i + 1;
        };

        // Emit event
        let dex_name = get_dex_name(dex_id);
        if (exists<EventStore>(admin_addr)) {
            let event_store = borrow_global_mut<EventStore>(admin_addr);
            event::emit_event(&mut event_store.aggregated_swap_events, AggregatedSwapEvent {
                user: user_addr,
                token_in: type_info::type_name<X>(),
                token_out: type_info::type_name<Y>(),
                amount_in,
                amount_out: actual_amount_out,
                dex_used: dex_name,
                dex_id,
                price_impact_bps: price_impact,
                aggregator_fee,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Internal function to get quote from specific DEX
    fun get_dex_quote<X, Y>(
        dex_id: u8,
        amount_in: u64,
        _admin_addr: address,
    ): (u64, u64) {
        // PLACEHOLDER: In production, these would call actual DEX contracts
        // For now, returning mock data based on DEX characteristics
        
        if (dex_id == DEX_LIQUIDSWAP) {
            // Liquidswap - largest liquidity, best prices for large trades
            let amount_out = (amount_in * 9950) / 10000; // 0.5% spread
            let price_impact = 50; // 0.5%
            (amount_out, price_impact)
        } else if (dex_id == DEX_PANORA) {
            // Panora - competitive pricing
            let amount_out = (amount_in * 9960) / 10000; // 0.4% spread
            let price_impact = 40; // 0.4%
            (amount_out, price_impact)
        } else if (dex_id == DEX_THALA) {
            // Thala - stable swap optimized
            let amount_out = (amount_in * 9970) / 10000; // 0.3% spread
            let price_impact = 30; // 0.3%
            (amount_out, price_impact)
        } else if (dex_id == DEX_CETUS) {
            // Cetus - concentrated liquidity
            let amount_out = (amount_in * 9980) / 10000; // 0.2% spread
            let price_impact = 20; // 0.2%
            (amount_out, price_impact)
        } else if (dex_id == DEX_CELLANA) {
            // Cellana - newer, smaller liquidity
            let amount_out = (amount_in * 9940) / 10000; // 0.6% spread
            let price_impact = 60; // 0.6%
            (amount_out, price_impact)
        } else {
            (0, 0)
        }
    }

    /// Internal function to execute swap on specific DEX
    fun execute_swap_on_dex<X, Y>(
        dex_id: u8,
        coin_in: Coin<X>,
        amount_in: u64,
        admin_addr: address,
    ): Coin<Y> {
        // PLACEHOLDER: In production, this would route to actual DEX contracts
        // For now, simulating swap by converting coin types
        
        // Get expected output
        let (expected_output, _) = get_dex_quote<X, Y>(dex_id, amount_in, admin_addr);
        
        // In real implementation:
        // - Call liquidswap::router::swap_exact_coin_for_coin() for Liquidswap
        // - Call panora::swap::execute() for Panora
        // - Call thala::stable_pool::swap() for Thala
        // - etc.
        
        // PLACEHOLDER: For testnet, this would require actual DEX contract integration
        // The real implementation should call external DEX contracts
        // For now, we abort as this is a placeholder that needs real DEX integration
        abort EDEX_NOT_AVAILABLE
    }

    /// Get DEX name from ID
    fun get_dex_name(dex_id: u8): String {
        if (dex_id == DEX_LIQUIDSWAP) {
            string::utf8(b"Liquidswap")
        } else if (dex_id == DEX_PANORA) {
            string::utf8(b"Panora")
        } else if (dex_id == DEX_THALA) {
            string::utf8(b"Thala")
        } else if (dex_id == DEX_CETUS) {
            string::utf8(b"Cetus")
        } else if (dex_id == DEX_CELLANA) {
            string::utf8(b"Cellana")
        } else {
            string::utf8(b"Unknown")
        }
    }

    /// Admin functions

    /// Enable/disable specific DEX
    public entry fun toggle_dex(
        admin: &signer,
        dex_id: u8,
        enabled: bool,
    ) acquires AggregatorRegistry {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        let registry = borrow_global_mut<AggregatorRegistry>(admin_addr);
        assert!(registry.admin == admin_addr, error::permission_denied(ENOT_ADMIN));

        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        while (i < len) {
            let dex_info = vector::borrow_mut(&mut registry.supported_dexs, i);
            if (dex_info.dex_id == dex_id) {
                dex_info.enabled = enabled;
                break
            };
            i = i + 1;
        };
    }

    /// Collect aggregator fees
    public entry fun collect_aggregator_fees<X>(
        admin: &signer,
        amount: u64,
    ) acquires AggregatorRegistry {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        let registry = borrow_global_mut<AggregatorRegistry>(admin_addr);
        assert!(registry.admin == admin_addr, error::permission_denied(ENOT_ADMIN));

        // Fees are already in admin's account from swaps
        // This function is just for tracking
        registry.fees_collected = registry.fees_collected - amount;
    }

    /// View functions

    #[view]
    public fun get_supported_dexs(admin_addr: address): vector<DEXInfo> acquires AggregatorRegistry {
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        let registry = borrow_global<AggregatorRegistry>(admin_addr);
        registry.supported_dexs
    }

    #[view]
    public fun get_aggregator_stats(
        admin_addr: address,
    ): (u64, u64, u64) acquires AggregatorRegistry {
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        let registry = borrow_global<AggregatorRegistry>(admin_addr);
        
        (
            registry.total_aggregated_volume,
            registry.total_swaps,
            registry.fees_collected
        )
    }

    #[view]
    public fun get_dex_stats(
        admin_addr: address,
        dex_id: u8,
    ): (u64, u64, bool) acquires AggregatorRegistry {
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        let registry = borrow_global<AggregatorRegistry>(admin_addr);

        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        while (i < len) {
            let dex_info = vector::borrow(&registry.supported_dexs, i);
            if (dex_info.dex_id == dex_id) {
                return (dex_info.total_volume, dex_info.swap_count, dex_info.enabled)
            };
            i = i + 1;
        };

        (0, 0, false)
    }

    #[view]
    public fun compare_prices<X, Y>(
        admin_addr: address,
        amount_in: u64,
    ): (u8, u64, u64, u64) acquires AggregatorRegistry {
        // Returns: (best_dex_id, best_output, worst_output, price_difference_bps)
        assert!(exists<AggregatorRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        
        let registry = borrow_global<AggregatorRegistry>(admin_addr);
        
        let best_dex_id: u8 = 0;
        let best_output: u64 = 0;
        let worst_output: u64 = 999999999999; // Large number

        let i = 0;
        let len = vector::length(&registry.supported_dexs);
        
        while (i < len) {
            let dex_info = vector::borrow(&registry.supported_dexs, i);
            
            if (dex_info.enabled) {
                let (amount_out, _) = get_dex_quote<X, Y>(dex_info.dex_id, amount_in, admin_addr);
                
                if (amount_out > best_output) {
                    best_output = amount_out;
                    best_dex_id = dex_info.dex_id;
                };
                
                if (amount_out < worst_output && amount_out > 0) {
                    worst_output = amount_out;
                };
            };
            
            i = i + 1;
        };

        let price_diff_bps = if (worst_output > 0 && best_output > worst_output) {
            ((best_output - worst_output) * BPS_DENOMINATOR) / worst_output
        } else {
            0
        };

        (best_dex_id, best_output, worst_output, price_diff_bps)
    }
}
