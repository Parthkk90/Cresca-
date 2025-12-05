// Move module for Cresca DeFi Bucket Protocol - MULTI-USER VERSION
// Bucket 2: DeFi Assets - UNI, AAVE, LINK
module cresca::bucket_defi {
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    /// Error codes
    const EALREADY_EXISTS: u64 = 1;
    const EINVALID_ARGUMENT: u64 = 2;
    const EINSUFFICIENT_COLLATERAL: u64 = 3;
    const ENOT_FOUND: u64 = 4;
    const EPERMISSION_DENIED: u64 = 5;

    /// Hardcoded token addresses - DeFi assets
    const UNI_ADDRESS: address = @0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b;
    const AAVE_ADDRESS: address = @0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3;
    const LINK_ADDRESS: address = @0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4;

    /// Hardcoded weights: UNI 40%, AAVE 35%, LINK 25%
    const UNI_WEIGHT: u64 = 40;
    const AAVE_WEIGHT: u64 = 35;
    const LINK_WEIGHT: u64 = 25;

    /// Hardcoded margin: 1 APT = 100000000 octas
    const DEFAULT_MARGIN: u64 = 100000000; // 1 APT

    /// FIX: Hardcoded protocol address (where Protocol storage lives)
    const PROTOCOL_ADDRESS: address = @0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db;

    /// Events
    #[event]
    struct BucketCreatedEvent has drop, store, copy {
        bucket_id: u64,
        owner: address,
        leverage: u64,
    }

    #[event]
    struct PositionOpenedEvent has drop, store, copy {
        position_id: u64,
        bucket_id: u64,
        owner: address,
        is_long: bool,
        margin: u64,
        entry_price: u64,
    }

    #[event]
    struct PositionClosedEvent has drop, store, copy {
        position_id: u64,
        owner: address,
        pnl: u64,
        profit: bool,
    }

    #[event]
    struct BucketRebalancedEvent has drop, store, copy {
        bucket_id: u64,
    }

    #[event]
    struct LiquidationEvent has drop, store, copy {
        position_id: u64,
        owner: address,
    }

    #[event]
    struct OracleUpdateEvent has drop, store, copy {
        uni_price: u64,
        aave_price: u64,
        link_price: u64,
        timestamp: u64,
    }

    /// Core Structs
    struct Bucket has store {
        assets: vector<address>,
        weights: vector<u64>,
        leverage: u64,
        owner: address,
    }

    struct Position has store {
        bucket_id: u64,
        is_long: bool,
        margin: u64,
        entry_price: u64,
        owner: address,
        active: bool,
    }

    /// Storage - Lives at PROTOCOL_ADDRESS only!
    /// V2: Now includes treasury to hold funds directly
    struct Protocol has key {
        buckets: vector<Bucket>,
        positions: vector<Position>,
        collateral_balance: u64,
        oracle_prices: vector<u64>,
        last_oracle_update: u64,
        treasury: Coin<AptosCoin>,  // V2: Store funds in the resource itself
    }

    /// V2: Treasury capability removed - using Coin<AptosCoin> instead

    /// Initialize protocol (only called once by protocol owner)
    public entry fun init(owner: &signer, leverage: u64) acquires Protocol {
        let addr = signer::address_of(owner);
        // FIXED: Each user creates Protocol at their own address
        assert!(!exists<Protocol>(addr), EALREADY_EXISTS);
        assert!(leverage > 0 && leverage <= 20, EINVALID_ARGUMENT);
        
        // V2: Create Protocol storage with empty treasury
        move_to(owner, Protocol { 
            buckets: vector::empty<Bucket>(),
            positions: vector::empty<Position>(),
            collateral_balance: 0,
            oracle_prices: vector::empty<u64>(),
            last_oracle_update: 0,
            treasury: coin::zero<AptosCoin>(),  // V2: Initialize empty treasury
        });

        // Automatically create default bucket with hardcoded assets
        create_default_bucket_internal(owner, leverage);
    }

    fun create_default_bucket_internal(_owner: &signer, leverage: u64) acquires Protocol {
        let protocol = borrow_global_mut<Protocol>(PROTOCOL_ADDRESS);
        
        let assets = vector::empty<address>();
        vector::push_back(&mut assets, UNI_ADDRESS);
        vector::push_back(&mut assets, AAVE_ADDRESS);
        vector::push_back(&mut assets, LINK_ADDRESS);
        
        let weights = vector::empty<u64>();
        vector::push_back(&mut weights, UNI_WEIGHT);
        vector::push_back(&mut weights, AAVE_WEIGHT);
        vector::push_back(&mut weights, LINK_WEIGHT);
        
        let bucket_id = vector::length(&protocol.buckets);
        
        let bucket = Bucket { 
            assets, 
            weights, 
            leverage, 
            owner: PROTOCOL_ADDRESS 
        };
        
        vector::push_back(&mut protocol.buckets, bucket);
        
        event::emit(BucketCreatedEvent {
            bucket_id,
            owner: PROTOCOL_ADDRESS,
            leverage,
        });
    }

    /// Deposit collateral
    public entry fun deposit_collateral(_owner: &signer, amount: u64) acquires Protocol {
        let protocol = borrow_global_mut<Protocol>(PROTOCOL_ADDRESS);
        protocol.collateral_balance = protocol.collateral_balance + amount;
    }

    /// FIX: Open LONG - Access Protocol at PROTOCOL_ADDRESS
    public entry fun open_long(owner: &signer, bucket_id: u64) acquires Protocol {
        open_position_internal(owner, bucket_id, true);
    }

    /// FIX: Open SHORT - Access Protocol at PROTOCOL_ADDRESS
    public entry fun open_short(owner: &signer, bucket_id: u64) acquires Protocol {
        open_position_internal(owner, bucket_id, false);
    }

    /// Internal function - V2: locks APT in Protocol treasury
    fun open_position_internal(
        owner: &signer, 
        bucket_id: u64, 
        is_long: bool
    ) acquires Protocol {
        let user_addr = signer::address_of(owner);
        let protocol = borrow_global_mut<Protocol>(PROTOCOL_ADDRESS);
        
        assert!(bucket_id < vector::length(&protocol.buckets), ENOT_FOUND);
        
        // V2: Withdraw from user and merge into Protocol treasury
        let margin_coins = coin::withdraw<AptosCoin>(owner, DEFAULT_MARGIN);
        coin::merge(&mut protocol.treasury, margin_coins);
        
        let entry_price = calculate_weighted_price(protocol);
        
        protocol.collateral_balance = protocol.collateral_balance + DEFAULT_MARGIN;
        
        let position_id = vector::length(&protocol.positions);
        let position = Position {
            bucket_id,
            is_long,
            margin: DEFAULT_MARGIN,
            entry_price,
            owner: user_addr,  // FIX: Track which user owns this position
            active: true,
        };
        
        vector::push_back(&mut protocol.positions, position);
        
        event::emit(PositionOpenedEvent {
            position_id,
            bucket_id,
            owner: user_addr,
            is_long,
            margin: DEFAULT_MARGIN,
            entry_price,
        });
    }

    /// Close position - V2: User can close directly, funds extracted from Protocol treasury
    public entry fun close_position(
        user: &signer,
        position_id: u64
    ) acquires Protocol {
        let user_addr = signer::address_of(user);
        
        let protocol = borrow_global_mut<Protocol>(PROTOCOL_ADDRESS);
        
        assert!(position_id < vector::length(&protocol.positions), ENOT_FOUND);
        
        let position = vector::borrow(&protocol.positions, position_id);
        assert!(position.owner == user_addr, EPERMISSION_DENIED);
        assert!(position.active, EINVALID_ARGUMENT);
        
        let bucket_id = position.bucket_id;
        let entry_price = position.entry_price;
        let margin = position.margin;
        let is_long = position.is_long;
        
        let exit_price = calculate_weighted_price(protocol);
        
        let bucket = vector::borrow(&protocol.buckets, bucket_id);
        let leverage = bucket.leverage;
        
        let (pnl, profit) = calculate_pnl(
            entry_price,
            exit_price,
            margin,
            is_long,
            leverage
        );
        
        let final_amount = if (profit) {
            margin + pnl
        } else {
            if (pnl >= margin) {
                0
            } else {
                margin - pnl
            }
        };
        
        let position_mut = vector::borrow_mut(&mut protocol.positions, position_id);
        position_mut.active = false;
        
        // Update collateral balance tracking
        protocol.collateral_balance = protocol.collateral_balance - final_amount;
        
        // V2: Extract funds from treasury and send to user
        if (final_amount > 0) {
            let return_coins = coin::extract(&mut protocol.treasury, final_amount);
            coin::deposit(user_addr, return_coins);
        };
        
        event::emit(PositionClosedEvent {
            position_id,
            owner: user_addr,
            pnl,
            profit,
        });
    }

    /// Update oracle
    public entry fun update_oracle(
        _oracle: &signer, 
        uni_price: u64, 
        aave_price: u64, 
        link_price: u64
    ) acquires Protocol {
        let protocol = borrow_global_mut<Protocol>(PROTOCOL_ADDRESS);
        
        let prices = vector::empty<u64>();
        vector::push_back(&mut prices, uni_price);
        vector::push_back(&mut prices, aave_price);
        vector::push_back(&mut prices, link_price);
        
        protocol.oracle_prices = prices;
        protocol.last_oracle_update = timestamp::now_seconds();
        
        event::emit(OracleUpdateEvent {
            uni_price,
            aave_price,
            link_price,
            timestamp: protocol.last_oracle_update,
        });
    }

    /// Helper functions
    fun calculate_weighted_price(protocol: &Protocol): u64 {
        let prices = &protocol.oracle_prices;
        
        if (vector::length(prices) < 3) {
            return 100000
        };
        
        let uni_price = *vector::borrow(prices, 0);
        let aave_price = *vector::borrow(prices, 1);
        let link_price = *vector::borrow(prices, 2);
        
        let weighted = (uni_price * UNI_WEIGHT + aave_price * AAVE_WEIGHT + link_price * LINK_WEIGHT) / 100;
        weighted
    }

    fun calculate_pnl(
        entry: u64, 
        exit: u64, 
        margin: u64, 
        is_long: bool,
        leverage: u64
    ): (u64, bool) {
        if (is_long) {
            if (exit > entry) {
                let profit = ((exit - entry) * margin * leverage) / entry;
                (profit, true)
            } else {
                let loss = ((entry - exit) * margin * leverage) / entry;
                (loss, false)
            }
        } else {
            if (entry > exit) {
                let profit = ((entry - exit) * margin * leverage) / entry;
                (profit, true)
            } else {
                let loss = ((exit - entry) * margin * leverage) / entry;
                (loss, false)
            }
        }
    }

    /// View functions - FIX: All use PROTOCOL_ADDRESS
    #[view]
    public fun get_collateral_balance(_addr: address): u64 acquires Protocol {
        borrow_global<Protocol>(PROTOCOL_ADDRESS).collateral_balance
    }

    #[view]
    public fun get_bucket_count(_addr: address): u64 acquires Protocol {
        vector::length(&borrow_global<Protocol>(PROTOCOL_ADDRESS).buckets)
    }

    #[view]
    public fun get_position_count(_addr: address): u64 acquires Protocol {
        vector::length(&borrow_global<Protocol>(PROTOCOL_ADDRESS).positions)
    }

    #[view]
    public fun get_position_details(addr: address, position_id: u64): (u64, bool, u64, u64, address, bool) acquires Protocol {
        let protocol = borrow_global<Protocol>(addr);
        assert!(position_id < vector::length(&protocol.positions), ENOT_FOUND);
        let pos = vector::borrow(&protocol.positions, position_id);
        (pos.bucket_id, pos.is_long, pos.margin, pos.entry_price, pos.owner, pos.active)
    }

    #[view]
    public fun get_oracle_prices(_addr: address): vector<u64> acquires Protocol {
        borrow_global<Protocol>(PROTOCOL_ADDRESS).oracle_prices
    }

    #[view]
    public fun get_last_oracle_update(_addr: address): u64 acquires Protocol {
        borrow_global<Protocol>(PROTOCOL_ADDRESS).last_oracle_update
    }
}
