// Move module for Cresca Bucket Protocol
module cresca::bucket_protocol {
    use std::vector;
    use std::signer;
    use std::event;
    use std::error;
    use std::option;

    /// Events
    struct BucketCreatedEvent has copy, drop, store {
        bucket_id: u64,
        owner: address,
        assets: vector<address>,
        weights: vector<u64>,
        leverage: u8,
    }

    struct PositionOpenedEvent has copy, drop, store {
        position_id: u64,
        bucket_id: u64,
        owner: address,
        is_long: bool,
        margin: u64,
        entry_price: u64,
    }

    struct PositionClosedEvent has copy, drop, store {
        position_id: u64,
        owner: address,
        pnl: i64,
    }

    struct BucketRebalancedEvent has copy, drop, store {
        bucket_id: u64,
        new_weights: vector<u64>,
    }

    struct LiquidationEvent has copy, drop, store {
        position_id: u64,
        owner: address,
        reason: vector<u8>,
    }

    /// Core Structs
    struct Bucket has key {
        assets: vector<address>,
        weights: vector<u64>,
        leverage: u8,
        owner: address,
    }

    struct Position has key {
        bucket_id: u64,
        is_long: bool,
        margin: u64,
        entry_price: u64,
        owner: address,
    }

    struct Collateral has key {
        owner: address,
        balance: u64,
    }

    /// Mock Oracle for price and funding rate simulation
    struct MockOracle has key {
        prices: vector<u64>, // price per asset
        funding_rates: vector<i64>, // funding rate per asset
    }

    /// Storage
    struct Buckets has key {
        buckets: vector<Bucket>,
    }

    struct Positions has key {
        positions: vector<Position>,
    }

    struct Collaterals has key {
        collaterals: vector<Collateral>,
    }

    struct Oracles has key {
        oracle: MockOracle,
    }

    /// Event Handles
    struct EventHandles has key {
        bucket_created_handle: event::EventHandle<BucketCreatedEvent>,
        position_opened_handle: event::EventHandle<PositionOpenedEvent>,
        position_closed_handle: event::EventHandle<PositionClosedEvent>,
        bucket_rebalanced_handle: event::EventHandle<BucketRebalancedEvent>,
        liquidation_handle: event::EventHandle<LiquidationEvent>,
    }

    /// Initialize storage and event handles
    public entry fun init(owner: &signer) {
        let addr = signer::address_of(owner);
        assert!(!exists<Buckets>(addr), error::already_exists(1));
        move_to(owner, Buckets { buckets: vector::empty<Bucket>() });
        move_to(owner, Positions { positions: vector::empty<Position>() });
        move_to(owner, Collaterals { collaterals: vector::empty<Collateral>() });
        move_to(owner, Oracles { oracle: MockOracle { prices: vector::empty<u64>(), funding_rates: vector::empty<i64>() } });
        move_to(owner, EventHandles {
            bucket_created_handle: event::new_event_handle<BucketCreatedEvent>(owner),
            position_opened_handle: event::new_event_handle<PositionOpenedEvent>(owner),
            position_closed_handle: event::new_event_handle<PositionClosedEvent>(owner),
            bucket_rebalanced_handle: event::new_event_handle<BucketRebalancedEvent>(owner),
            liquidation_handle: event::new_event_handle<LiquidationEvent>(owner),
        });
    }

    /// Create a new bucket
    public entry fun create_bucket(owner: &signer, assets: vector<address>, weights: vector<u64>, leverage: u8) {
        let addr = signer::address_of(owner);
        assert!(vector::length(assets) == vector::length(weights), error::invalid_argument(2));
        assert!(leverage > 0 && leverage <= 20, error::invalid_argument(3)); // leverage cap
        let buckets = borrow_global_mut<Buckets>(addr);
        let bucket_id = vector::length(&buckets.buckets) as u64;
        let bucket = Bucket { assets, weights, leverage, owner: addr };
        vector::push_back(&mut buckets.buckets, bucket);
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.bucket_created_handle, BucketCreatedEvent {
            bucket_id,
            owner: addr,
            assets: bucket.assets,
            weights: bucket.weights,
            leverage: bucket.leverage,
        });
    }

    /// Deposit collateral for trading
    public entry fun deposit_collateral(owner: &signer, amount: u64) {
        let addr = signer::address_of(owner);
        let collaterals = borrow_global_mut<Collaterals>(addr);
        let mut found = false;
        let len = vector::length(&collaterals.collaterals);
        let mut i = 0;
        while (i < len) {
            let c = &mut vector::borrow_mut(&mut collaterals.collaterals, i);
            if (c.owner == addr) {
                c.balance = c.balance + amount;
                found = true;
                break;
            }
            i = i + 1;
        }
        if (!found) {
            vector::push_back(&mut collaterals.collaterals, Collateral { owner: addr, balance: amount });
        }
    }

    /// Open a position on a bucket
    public entry fun open_position(owner: &signer, bucket_id: u64, is_long: bool, margin: u64) {
        let addr = signer::address_of(owner);
        let buckets = borrow_global<Buckets>(addr);
        assert!((bucket_id as usize) < vector::length(&buckets.buckets), error::not_found(4));
        let bucket = &vector::borrow(&buckets.buckets, bucket_id as usize);
        let collaterals = borrow_global_mut<Collaterals>(addr);
        let mut i = 0;
        let mut found = false;
        let len = vector::length(&collaterals.collaterals);
        while (i < len) {
            let c = &mut vector::borrow_mut(&mut collaterals.collaterals, i);
            if (c.owner == addr) {
                assert!(c.balance >= margin, error::invalid_argument(5));
                c.balance = c.balance - margin;
                found = true;
                break;
            }
            i = i + 1;
        }
        assert!(found, error::not_found(6));
        let oracles = borrow_global<Oracles>(addr);
        let entry_price = if (vector::length(&oracles.oracle.prices) > 0) {
            vector::borrow(&oracles.oracle.prices, 0)
        } else {
            1000 // mock price
        };
        let positions = borrow_global_mut<Positions>(addr);
        let position_id = vector::length(&positions.positions) as u64;
        let position = Position {
            bucket_id,
            is_long,
            margin,
            entry_price,
            owner: addr,
        };
        vector::push_back(&mut positions.positions, position);
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.position_opened_handle, PositionOpenedEvent {
            position_id,
            bucket_id,
            owner: addr,
            is_long,
            margin,
            entry_price,
        });
    }

    /// Rebalance bucket weights (only owner)
    public entry fun rebalance_bucket(owner: &signer, bucket_id: u64, new_weights: vector<u64>) {
        let addr = signer::address_of(owner);
        let buckets = borrow_global_mut<Buckets>(addr);
        assert!((bucket_id as usize) < vector::length(&buckets.buckets), error::not_found(7));
        let bucket = &mut vector::borrow_mut(&mut buckets.buckets, bucket_id as usize);
        assert!(bucket.owner == addr, error::permission_denied(8));
        assert!(vector::length(&bucket.assets) == vector::length(&new_weights), error::invalid_argument(9));
        bucket.weights = new_weights;
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.bucket_rebalanced_handle, BucketRebalancedEvent {
            bucket_id,
            new_weights,
        });
    }

    /// Close a position and return P&L (mock calculation)
    public entry fun close_position(owner: &signer, position_id: u64) {
        let addr = signer::address_of(owner);
        let positions = borrow_global_mut<Positions>(addr);
        assert!((position_id as usize) < vector::length(&positions.positions), error::not_found(10));
        let position = &mut vector::borrow_mut(&mut positions.positions, position_id as usize);
        assert!(position.owner == addr, error::permission_denied(11));
        let oracles = borrow_global<Oracles>(addr);
        let exit_price = if (vector::length(&oracles.oracle.prices) > 0) {
            vector::borrow(&oracles.oracle.prices, 0)
        } else {
            1000 // mock price
        };
        let pnl = if (position.is_long) {
            (exit_price as i64 - position.entry_price as i64) * (position.margin as i64) / (position.entry_price as i64)
        } else {
            (position.entry_price as i64 - exit_price as i64) * (position.margin as i64) / (position.entry_price as i64)
        };
        // Remove position (simple: set margin to 0)
        position.margin = 0;
        let collaterals = borrow_global_mut<Collaterals>(addr);
        let mut i = 0;
        let len = vector::length(&collaterals.collaterals);
        while (i < len) {
            let c = &mut vector::borrow_mut(&mut collaterals.collaterals, i);
            if (c.owner == addr) {
                c.balance = c.balance + position.margin + (if pnl > 0 { pnl as u64 } else { 0 });
                break;
            }
            i = i + 1;
        }
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.position_closed_handle, PositionClosedEvent {
            position_id,
            owner: addr,
            pnl,
        });
    }

    /// Mock: Update oracle prices and funding rates
    public entry fun update_oracle(owner: &signer, prices: vector<u64>, funding_rates: vector<i64>) {
        let addr = signer::address_of(owner);
        let oracles = borrow_global_mut<Oracles>(addr);
        oracles.oracle.prices = prices;
        oracles.oracle.funding_rates = funding_rates;
    }

    /// Placeholder for liquidation logic
    public entry fun liquidate_position(owner: &signer, position_id: u64, reason: vector<u8>) {
        let addr = signer::address_of(owner);
        let positions = borrow_global_mut<Positions>(addr);
        assert!((position_id as usize) < vector::length(&positions.positions), error::not_found(12));
        let position = &mut vector::borrow_mut(&mut positions.positions, position_id as usize);
        // Only allow if margin is too low (mock check)
        if (position.margin < 10) {
            position.margin = 0;
            let handles = borrow_global_mut<EventHandles>(addr);
            event::emit_event(&mut handles.liquidation_handle, LiquidationEvent {
                position_id,
                owner: addr,
                reason,
            });
        }
    }

    /// --- Test Placeholders ---
    /// #[test]
    /// fun test_create_bucket() {
    ///     // TODO: Write unit test for bucket creation
    /// }
    ///
    /// #[test]
    /// fun test_open_and_close_position() {
    ///     // TODO: Write unit test for position management
    /// }

    /// --- End of Module ---
}
