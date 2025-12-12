// Cresca Escrow Swap - Instant token swaps with escrow safety for single-wallet operations
module cresca::escrow_swap {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_std::type_info;
    use std::error;

    /// Error codes
    const ENOT_INITIALIZED: u64 = 1;
    const EINSUFFICIENT_LIQUIDITY: u64 = 2;
    const EZERO_AMOUNT: u64 = 3;
    const ENOT_ADMIN: u64 = 4;
    const EPOOL_ALREADY_EXISTS: u64 = 5;
    const EPOOL_NOT_FOUND: u64 = 6;
    const ESLIPPAGE_EXCEEDED: u64 = 7;
    const EINVALID_SLIPPAGE: u64 = 8;

    /// Swap fee (0.3% = 30 basis points)
    const SWAP_FEE_BPS: u64 = 30;
    const BPS_DENOMINATOR: u64 = 10000;

    /// Maximum slippage tolerance (5% = 500 basis points)
    const MAX_SLIPPAGE_BPS: u64 = 500;

    /// Escrow liquidity pool for token pair
    struct LiquidityPool<phantom X, phantom Y> has key {
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        total_x: u64,
        total_y: u64,
        fees_collected_x: u64,
        fees_collected_y: u64,
        swap_count: u64,
        admin: address,
    }

    /// Global escrow registry
    struct EscrowRegistry has key {
        admin: address,
        total_pools: u64,
        total_volume: u64,
    }

    /// Events
    struct SwapExecutedEvent has drop, store {
        user: address,
        token_in: String,
        token_out: String,
        amount_in: u64,
        amount_out: u64,
        fee_collected: u64,
        timestamp: u64,
    }

    struct LiquidityAddedEvent has drop, store {
        provider: address,
        token_x: String,
        token_y: String,
        amount_x: u64,
        amount_y: u64,
        timestamp: u64,
    }

    struct LiquidityRemovedEvent has drop, store {
        provider: address,
        token_x: String,
        token_y: String,
        amount_x: u64,
        amount_y: u64,
        timestamp: u64,
    }

    struct EventStore has key {
        swap_events: EventHandle<SwapExecutedEvent>,
        liquidity_added_events: EventHandle<LiquidityAddedEvent>,
        liquidity_removed_events: EventHandle<LiquidityRemovedEvent>,
    }

    /// Initialize escrow system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        assert!(!exists<EscrowRegistry>(admin_addr), error::already_exists(EPOOL_ALREADY_EXISTS));

        move_to(admin, EscrowRegistry {
            admin: admin_addr,
            total_pools: 0,
            total_volume: 0,
        });

        move_to(admin, EventStore {
            swap_events: account::new_event_handle<SwapExecutedEvent>(admin),
            liquidity_added_events: account::new_event_handle<LiquidityAddedEvent>(admin),
            liquidity_removed_events: account::new_event_handle<LiquidityRemovedEvent>(admin),
        });
    }

    /// Create liquidity pool for token pair (Admin only)
    public entry fun create_pool<X, Y>(
        admin: &signer,
        initial_x: u64,
        initial_y: u64,
    ) acquires EscrowRegistry {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<EscrowRegistry>(admin_addr), error::not_found(ENOT_INITIALIZED));
        let registry = borrow_global_mut<EscrowRegistry>(admin_addr);
        assert!(registry.admin == admin_addr, error::permission_denied(ENOT_ADMIN));

        assert!(initial_x > 0 && initial_y > 0, error::invalid_argument(EZERO_AMOUNT));
        assert!(!exists<LiquidityPool<X, Y>>(admin_addr), error::already_exists(EPOOL_ALREADY_EXISTS));

        // Withdraw initial liquidity from admin
        let coin_x = coin::withdraw<X>(admin, initial_x);
        let coin_y = coin::withdraw<Y>(admin, initial_y);

        // Create pool
        move_to(admin, LiquidityPool<X, Y> {
            coin_x,
            coin_y,
            total_x: initial_x,
            total_y: initial_y,
            fees_collected_x: 0,
            fees_collected_y: 0,
            swap_count: 0,
            admin: admin_addr,
        });

        registry.total_pools = registry.total_pools + 1;
    }

    /// Swap X for Y (Escrow holds X, releases Y instantly)
    public entry fun swap_x_to_y<X, Y>(
        user: &signer,
        amount_in: u64,
        min_amount_out: u64,
        admin_addr: address,
    ) acquires LiquidityPool, EventStore {
        let user_addr = signer::address_of(user);
        
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));

        let pool = borrow_global_mut<LiquidityPool<X, Y>>(admin_addr);

        // Calculate swap amount with constant product formula (x * y = k)
        let amount_in_with_fee = amount_in * (BPS_DENOMINATOR - SWAP_FEE_BPS) / BPS_DENOMINATOR;
        let amount_out = (pool.total_y * amount_in_with_fee) / (pool.total_x + amount_in_with_fee);
        
        // Slippage protection
        assert!(amount_out >= min_amount_out, error::invalid_argument(ESLIPPAGE_EXCEEDED));
        assert!(amount_out < pool.total_y, error::invalid_state(EINSUFFICIENT_LIQUIDITY));

        let fee_amount = amount_in - amount_in_with_fee;

        // ESCROW STEP 1: User deposits X to escrow
        let coin_in = coin::withdraw<X>(user, amount_in);
        coin::merge(&mut pool.coin_x, coin_in);

        // ESCROW STEP 2: Escrow releases Y to user instantly
        let coin_out = coin::extract(&mut pool.coin_y, amount_out);
        coin::deposit(user_addr, coin_out);

        // Update pool state
        pool.total_x = pool.total_x + amount_in;
        pool.total_y = pool.total_y - amount_out;
        pool.fees_collected_x = pool.fees_collected_x + fee_amount;
        pool.swap_count = pool.swap_count + 1;

        // Emit event
        if (exists<EventStore>(admin_addr)) {
            let event_store = borrow_global_mut<EventStore>(admin_addr);
            event::emit_event(&mut event_store.swap_events, SwapExecutedEvent {
                user: user_addr,
                token_in: type_info::type_name<X>(),
                token_out: type_info::type_name<Y>(),
                amount_in,
                amount_out,
                fee_collected: fee_amount,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Swap Y for X (Escrow holds Y, releases X instantly)
    public entry fun swap_y_to_x<X, Y>(
        user: &signer,
        amount_in: u64,
        min_amount_out: u64,
        admin_addr: address,
    ) acquires LiquidityPool, EventStore {
        let user_addr = signer::address_of(user);
        
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));

        let pool = borrow_global_mut<LiquidityPool<X, Y>>(admin_addr);

        // Calculate swap amount
        let amount_in_with_fee = amount_in * (BPS_DENOMINATOR - SWAP_FEE_BPS) / BPS_DENOMINATOR;
        let amount_out = (pool.total_x * amount_in_with_fee) / (pool.total_y + amount_in_with_fee);
        
        // Slippage protection
        assert!(amount_out >= min_amount_out, error::invalid_argument(ESLIPPAGE_EXCEEDED));
        assert!(amount_out < pool.total_x, error::invalid_state(EINSUFFICIENT_LIQUIDITY));

        let fee_amount = amount_in - amount_in_with_fee;

        // ESCROW STEP 1: User deposits Y to escrow
        let coin_in = coin::withdraw<Y>(user, amount_in);
        coin::merge(&mut pool.coin_y, coin_in);

        // ESCROW STEP 2: Escrow releases X to user instantly
        let coin_out = coin::extract(&mut pool.coin_x, amount_out);
        coin::deposit(user_addr, coin_out);

        // Update pool state
        pool.total_y = pool.total_y + amount_in;
        pool.total_x = pool.total_x - amount_out;
        pool.fees_collected_y = pool.fees_collected_y + fee_amount;
        pool.swap_count = pool.swap_count + 1;

        // Emit event
        if (exists<EventStore>(admin_addr)) {
            let event_store = borrow_global_mut<EventStore>(admin_addr);
            event::emit_event(&mut event_store.swap_events, SwapExecutedEvent {
                user: user_addr,
                token_in: type_info::type_name<Y>(),
                token_out: type_info::type_name<X>(),
                amount_in,
                amount_out,
                fee_collected: fee_amount,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Get quote for X to Y swap
    #[view]
    public fun get_quote_x_to_y<X, Y>(
        admin_addr: address,
        amount_in: u64,
    ): (u64, u64) acquires LiquidityPool {
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global<LiquidityPool<X, Y>>(admin_addr);
        
        let amount_in_with_fee = amount_in * (BPS_DENOMINATOR - SWAP_FEE_BPS) / BPS_DENOMINATOR;
        let amount_out = (pool.total_y * amount_in_with_fee) / (pool.total_x + amount_in_with_fee);
        let fee = amount_in - amount_in_with_fee;
        
        (amount_out, fee)
    }

    /// Get quote for Y to X swap
    #[view]
    public fun get_quote_y_to_x<X, Y>(
        admin_addr: address,
        amount_in: u64,
    ): (u64, u64) acquires LiquidityPool {
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global<LiquidityPool<X, Y>>(admin_addr);
        
        let amount_in_with_fee = amount_in * (BPS_DENOMINATOR - SWAP_FEE_BPS) / BPS_DENOMINATOR;
        let amount_out = (pool.total_x * amount_in_with_fee) / (pool.total_y + amount_in_with_fee);
        let fee = amount_in - amount_in_with_fee;
        
        (amount_out, fee)
    }

    /// Add liquidity to pool (Admin only)
    public entry fun add_liquidity<X, Y>(
        provider: &signer,
        amount_x: u64,
        amount_y: u64,
        admin_addr: address,
    ) acquires LiquidityPool, EventStore {
        let provider_addr = signer::address_of(provider);
        
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global_mut<LiquidityPool<X, Y>>(admin_addr);
        
        assert!(provider_addr == pool.admin, error::permission_denied(ENOT_ADMIN));
        assert!(amount_x > 0 && amount_y > 0, error::invalid_argument(EZERO_AMOUNT));

        // Withdraw liquidity from provider
        let coin_x = coin::withdraw<X>(provider, amount_x);
        let coin_y = coin::withdraw<Y>(provider, amount_y);

        // Add to pool
        coin::merge(&mut pool.coin_x, coin_x);
        coin::merge(&mut pool.coin_y, coin_y);
        pool.total_x = pool.total_x + amount_x;
        pool.total_y = pool.total_y + amount_y;

        // Emit event
        if (exists<EventStore>(admin_addr)) {
            let event_store = borrow_global_mut<EventStore>(admin_addr);
            event::emit_event(&mut event_store.liquidity_added_events, LiquidityAddedEvent {
                provider: provider_addr,
                token_x: type_info::type_name<X>(),
                token_y: type_info::type_name<Y>(),
                amount_x,
                amount_y,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Remove liquidity from pool (Admin only)
    public entry fun remove_liquidity<X, Y>(
        admin: &signer,
        amount_x: u64,
        amount_y: u64,
    ) acquires LiquidityPool, EventStore {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global_mut<LiquidityPool<X, Y>>(admin_addr);
        
        assert!(admin_addr == pool.admin, error::permission_denied(ENOT_ADMIN));
        assert!(amount_x <= pool.total_x && amount_y <= pool.total_y, error::invalid_state(EINSUFFICIENT_LIQUIDITY));

        // Extract from pool
        let coin_x = coin::extract(&mut pool.coin_x, amount_x);
        let coin_y = coin::extract(&mut pool.coin_y, amount_y);

        // Deposit to admin
        coin::deposit(admin_addr, coin_x);
        coin::deposit(admin_addr, coin_y);

        pool.total_x = pool.total_x - amount_x;
        pool.total_y = pool.total_y - amount_y;

        // Emit event
        if (exists<EventStore>(admin_addr)) {
            let event_store = borrow_global_mut<EventStore>(admin_addr);
            event::emit_event(&mut event_store.liquidity_removed_events, LiquidityRemovedEvent {
                provider: admin_addr,
                token_x: type_info::type_name<X>(),
                token_y: type_info::type_name<Y>(),
                amount_x,
                amount_y,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Collect accumulated fees (Admin only)
    public entry fun collect_fees<X, Y>(
        admin: &signer,
    ) acquires LiquidityPool {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global_mut<LiquidityPool<X, Y>>(admin_addr);
        
        assert!(admin_addr == pool.admin, error::permission_denied(ENOT_ADMIN));

        // Extract fee coins
        if (pool.fees_collected_x > 0) {
            let fee_coin_x = coin::extract(&mut pool.coin_x, pool.fees_collected_x);
            coin::deposit(admin_addr, fee_coin_x);
            pool.total_x = pool.total_x - pool.fees_collected_x;
            pool.fees_collected_x = 0;
        };

        if (pool.fees_collected_y > 0) {
            let fee_coin_y = coin::extract(&mut pool.coin_y, pool.fees_collected_y);
            coin::deposit(admin_addr, fee_coin_y);
            pool.total_y = pool.total_y - pool.fees_collected_y;
            pool.fees_collected_y = 0;
        };
    }

    /// View functions

    #[view]
    public fun get_pool_info<X, Y>(
        admin_addr: address,
    ): (u64, u64, u64, u64, u64) acquires LiquidityPool {
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global<LiquidityPool<X, Y>>(admin_addr);
        
        (
            pool.total_x,
            pool.total_y,
            pool.fees_collected_x,
            pool.fees_collected_y,
            pool.swap_count
        )
    }

    #[view]
    public fun calculate_price<X, Y>(
        admin_addr: address,
    ): u64 acquires LiquidityPool {
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global<LiquidityPool<X, Y>>(admin_addr);
        
        // Price of X in terms of Y (with 8 decimal precision)
        (pool.total_y * 100000000) / pool.total_x
    }

    #[view]
    public fun get_pool_liquidity<X, Y>(
        admin_addr: address,
    ): (u64, u64) acquires LiquidityPool {
        assert!(exists<LiquidityPool<X, Y>>(admin_addr), error::not_found(EPOOL_NOT_FOUND));
        let pool = borrow_global<LiquidityPool<X, Y>>(admin_addr);
        
        (pool.total_x, pool.total_y)
    }
}
