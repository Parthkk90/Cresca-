// Cresca Atomic Swap - Bidirectional peer-to-peer token swap contract
// insted taking the amount_y_expected from application, have a api call to pyth network to get the current real value

module cresca::swap {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_std::type_info;
    use aptos_std::table::{Self, Table};
    use std::error;

    /// Error codes
    const ESWAP_NOT_FOUND: u64 = 1;
    const ESWAP_ALREADY_EXISTS: u64 = 2;
    const ENOT_INITIATOR: u64 = 3;
    const ENOT_PARTICIPANT: u64 = 4;
    const EZERO_AMOUNT: u64 = 5;
    const ESWAP_EXPIRED: u64 = 6;
    const ESWAP_NOT_EXPIRED: u64 = 7;
    const ESWAP_ALREADY_COMPLETED: u64 = 8;

    /// Default swap timeout (1 hour in seconds)
    const DEFAULT_TIMEOUT: u64 = 3600;

    /// Atomic swap state
    struct AtomicSwap<phantom X, phantom Y> has store {
        initiator: address,
        participant: address,
        amount_x: u64,
        amount_y: u64,
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        timeout: u64,
        completed: bool,
        cancelled: bool,
    }

    /// Swap registry per user
    struct SwapRegistry<phantom X, phantom Y> has key {
        swaps: Table<u64, AtomicSwap<X, Y>>,
        next_swap_id: u64,
    }

    /// Events
    struct SwapInitiatedEvent has drop, store {
        swap_id: u64,
        initiator: address,
        participant: address,
        amount_x: u64,
        amount_y: u64,
        token_x: String,
        token_y: String,
        timeout: u64,
    }

    struct SwapCompletedEvent has drop, store {
        swap_id: u64,
        initiator: address,
        participant: address,
    }

    struct SwapCancelledEvent has drop, store {
        swap_id: u64,
        initiator: address,
    }

    struct EventStore has key {
        initiated_events: EventHandle<SwapInitiatedEvent>,
        completed_events: EventHandle<SwapCompletedEvent>,
        cancelled_events: EventHandle<SwapCancelledEvent>,
    }

    /// Initialize swap module for user
    public entry fun initialize(user: &signer) {
        let user_addr = signer::address_of(user);
        
        if (!exists<EventStore>(user_addr)) {
            move_to(user, EventStore {
                initiated_events: account::new_event_handle<SwapInitiatedEvent>(user),
                completed_events: account::new_event_handle<SwapCompletedEvent>(user),
                cancelled_events: account::new_event_handle<SwapCancelledEvent>(user),
            });
        };
    }

    /// Initiate atomic swap: Initiator deposits X, expects Y from participant
    public entry fun initiate_swap<X, Y>(
        initiator: &signer,
        participant: address,
        amount_x: u64,
        amount_y_expected: u64,
        timeout_seconds: u64,
    ) acquires SwapRegistry, EventStore {
        let initiator_addr = signer::address_of(initiator);
        
        assert!(amount_x > 0 && amount_y_expected > 0, error::invalid_argument(EZERO_AMOUNT));

        // Initialize registry if needed
        if (!exists<SwapRegistry<X, Y>>(initiator_addr)) {
            move_to(initiator, SwapRegistry<X, Y> {
                swaps: table::new(),
                next_swap_id: 0,
            });
        };

        let registry = borrow_global_mut<SwapRegistry<X, Y>>(initiator_addr);
        let swap_id = registry.next_swap_id;
        registry.next_swap_id = swap_id + 1;

        // Withdraw initiator's coins
        let coin_x = coin::withdraw<X>(initiator, amount_x);

        // Calculate timeout
        let timeout = if (timeout_seconds == 0) {
            timestamp::now_seconds() + DEFAULT_TIMEOUT
        } else {
            timestamp::now_seconds() + timeout_seconds
        };

        // Create swap
        let swap = AtomicSwap<X, Y> {
            initiator: initiator_addr,
            participant,
            amount_x,
            amount_y: amount_y_expected,
            coin_x,
            coin_y: coin::zero<Y>(),
            timeout,
            completed: false,
            cancelled: false,
        };

        table::add(&mut registry.swaps, swap_id, swap);

        // Emit event
        if (exists<EventStore>(initiator_addr)) {
            let event_store = borrow_global_mut<EventStore>(initiator_addr);
            event::emit_event(&mut event_store.initiated_events, SwapInitiatedEvent {
                swap_id,
                initiator: initiator_addr,
                participant,
                amount_x,
                amount_y: amount_y_expected,
                token_x: type_info::type_name<X>(),
                token_y: type_info::type_name<Y>(),
                timeout,
            });
        };
    }

    /// Complete swap: Participant deposits Y and both parties receive coins
    public entry fun complete_swap<X, Y>(
        participant: &signer,
        initiator_addr: address,
        swap_id: u64,
    ) acquires SwapRegistry, EventStore {
        let participant_addr = signer::address_of(participant);
        
        assert!(exists<SwapRegistry<X, Y>>(initiator_addr), error::not_found(ESWAP_NOT_FOUND));
        let registry = borrow_global_mut<SwapRegistry<X, Y>>(initiator_addr);
        assert!(table::contains(&registry.swaps, swap_id), error::not_found(ESWAP_NOT_FOUND));

        let swap = table::borrow_mut(&mut registry.swaps, swap_id);
        
        // Validations
        assert!(swap.participant == participant_addr, error::permission_denied(ENOT_PARTICIPANT));
        assert!(!swap.completed, error::invalid_state(ESWAP_ALREADY_COMPLETED));
        assert!(!swap.cancelled, error::invalid_state(ESWAP_ALREADY_COMPLETED));
        assert!(timestamp::now_seconds() < swap.timeout, error::invalid_state(ESWAP_EXPIRED));

        // Withdraw participant's coins
        let coin_y = coin::withdraw<Y>(participant, swap.amount_y);
        coin::merge(&mut swap.coin_y, coin_y);

        // Extract coins for exchange
        let coin_x_for_participant = coin::extract_all(&mut swap.coin_x);
        let coin_y_for_initiator = coin::extract_all(&mut swap.coin_y);

        // Deposit to respective parties
        coin::deposit(participant_addr, coin_x_for_participant);
        coin::deposit(swap.initiator, coin_y_for_initiator);

        swap.completed = true;

        // Emit event
        if (exists<EventStore>(initiator_addr)) {
            let event_store = borrow_global_mut<EventStore>(initiator_addr);
            event::emit_event(&mut event_store.completed_events, SwapCompletedEvent {
                swap_id,
                initiator: swap.initiator,
                participant: participant_addr,
            });
        };
    }

    /// Cancel swap after timeout: Refunds initiator
    public entry fun cancel_swap<X, Y>(
        initiator: &signer,
        swap_id: u64,
    ) acquires SwapRegistry, EventStore {
        let initiator_addr = signer::address_of(initiator);
        
        assert!(exists<SwapRegistry<X, Y>>(initiator_addr), error::not_found(ESWAP_NOT_FOUND));
        let registry = borrow_global_mut<SwapRegistry<X, Y>>(initiator_addr);
        assert!(table::contains(&registry.swaps, swap_id), error::not_found(ESWAP_NOT_FOUND));

        let swap = table::borrow_mut(&mut registry.swaps, swap_id);
        
        // Validations
        assert!(swap.initiator == initiator_addr, error::permission_denied(ENOT_INITIATOR));
        assert!(!swap.completed, error::invalid_state(ESWAP_ALREADY_COMPLETED));
        assert!(!swap.cancelled, error::invalid_state(ESWAP_ALREADY_COMPLETED));
        assert!(timestamp::now_seconds() >= swap.timeout, error::invalid_state(ESWAP_NOT_EXPIRED));

        // Refund initiator
        let refund = coin::extract_all(&mut swap.coin_x);
        coin::deposit(initiator_addr, refund);

        swap.cancelled = true;

        // Emit event
        if (exists<EventStore>(initiator_addr)) {
            let event_store = borrow_global_mut<EventStore>(initiator_addr);
            event::emit_event(&mut event_store.cancelled_events, SwapCancelledEvent {
                swap_id,
                initiator: initiator_addr,
            });
        };
    }

    /// View functions

    #[view]
    public fun get_swap_details<X, Y>(
        initiator: address,
        swap_id: u64,
    ): (address, address, u64, u64, u64, bool, bool) acquires SwapRegistry {
        assert!(exists<SwapRegistry<X, Y>>(initiator), error::not_found(ESWAP_NOT_FOUND));
        let registry = borrow_global<SwapRegistry<X, Y>>(initiator);
        assert!(table::contains(&registry.swaps, swap_id), error::not_found(ESWAP_NOT_FOUND));

        let swap = table::borrow(&registry.swaps, swap_id);
        (
            swap.initiator,
            swap.participant,
            swap.amount_x,
            swap.amount_y,
            swap.timeout,
            swap.completed,
            swap.cancelled
        )
    }

    #[view]
    public fun is_swap_expired<X, Y>(
        initiator: address,
        swap_id: u64,
    ): bool acquires SwapRegistry {
        assert!(exists<SwapRegistry<X, Y>>(initiator), error::not_found(ESWAP_NOT_FOUND));
        let registry = borrow_global<SwapRegistry<X, Y>>(initiator);
        assert!(table::contains(&registry.swaps, swap_id), error::not_found(ESWAP_NOT_FOUND));

        let swap = table::borrow(&registry.swaps, swap_id);
        timestamp::now_seconds() >= swap.timeout
    }

    #[view]
    public fun get_next_swap_id<X, Y>(user: address): u64 acquires SwapRegistry {
        if (!exists<SwapRegistry<X, Y>>(user)) {
            return 0
        };
        let registry = borrow_global<SwapRegistry<X, Y>>(user);
        registry.next_swap_id
    }
}

