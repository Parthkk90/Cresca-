module aptpays::smart_wallet_v2 {

    use std::signer;
    use std::coin;
    use std::aptos_coin::AptosCoin;
    use std::event;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    /// Wallet resource for tracking transactions
    struct Wallet has key {
        owner: address,
        total_sent: u64,    
        total_received: u64,
        send_events: event::EventHandle<SendEvent>,
        receive_events: event::EventHandle<ReceiveEvent>,
    }

    struct SendEvent has copy, drop, store {
        to: address,
        amount: u64,
        timestamp: u64,
    }

    struct ReceiveEvent has copy, drop, store {
        from: address,
        amount: u64,
        timestamp: u64,
    }

    /// Error codes
    const E_WALLET_NOT_INITIALIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_WALLET_ALREADY_EXISTS: u64 = 3;

    /// Initialize wallet for the user
    public entry fun init_wallet(account: &signer) {
        let owner = signer::address_of(account);
        assert!(!exists<Wallet>(owner), E_WALLET_ALREADY_EXISTS);
        
        move_to(account, Wallet {
            owner,
            total_sent: 0,
            total_received: 0,
            send_events: account::new_event_handle<SendEvent>(account),
            receive_events: account::new_event_handle<ReceiveEvent>(account),
        });
    }
    
    /// OPTIMIZED: Send coins with automatic receiver tracking
    public entry fun send_coins(sender: &signer, to: address, amount: u64) acquires Wallet {
        let sender_addr = signer::address_of(sender);
        
        // Ensure sender has wallet
        assert!(exists<Wallet>(sender_addr), E_WALLET_NOT_INITIALIZED);
        
        // Check balance before transfer
        let balance = coin::balance<AptosCoin>(sender_addr);
        assert!(balance >= amount, E_INSUFFICIENT_BALANCE);
        
        // Transfer coins
        coin::transfer<AptosCoin>(sender, to, amount);
        
        // Update sender wallet
        let sender_wallet = borrow_global_mut<Wallet>(sender_addr);
        sender_wallet.total_sent = sender_wallet.total_sent + amount;
        event::emit_event(&mut sender_wallet.send_events, SendEvent { 
            to, 
            amount,
            timestamp: timestamp::now_seconds(),
        });
        
        // Auto-update receiver wallet if exists
        if (exists<Wallet>(to)) {
            let receiver_wallet = borrow_global_mut<Wallet>(to);
            receiver_wallet.total_received = receiver_wallet.total_received + amount;
            event::emit_event(&mut receiver_wallet.receive_events, ReceiveEvent { 
                from: sender_addr, 
                amount,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// OPTIMIZED: Batch send to multiple recipients
    public entry fun batch_send(sender: &signer, recipients: vector<address>, amounts: vector<u64>) acquires Wallet {
        let sender_addr = signer::address_of(sender);
        assert!(exists<Wallet>(sender_addr), E_WALLET_NOT_INITIALIZED);
        
        let i = 0;
        let len = std::vector::length(&recipients);
        
        while (i < len) {
            let to = *std::vector::borrow(&recipients, i);
            let amount = *std::vector::borrow(&amounts, i);
            send_coins(sender, to, amount);
            i = i + 1;
        };
    }

    // View wallet stats (total_sent, total_received)
    #[view]
    public fun get_wallet(owner: address): (u64, u64) acquires Wallet {
        assert!(exists<Wallet>(owner), E_WALLET_NOT_INITIALIZED);
        let wallet = borrow_global<Wallet>(owner);
        (wallet.total_sent, wallet.total_received)
    }

    // View APT balance (native Aptos balance)
    #[view]
    public fun get_balance(owner: address): u64 {
        coin::balance<AptosCoin>(owner)
    }

    // Check if wallet is initialized
    #[view]
    public fun wallet_exists(owner: address): bool {
        exists<Wallet>(owner)
    }

    // View complete wallet info
    #[view]
    public fun get_wallet_info(owner: address): (address, u64, u64, u64) acquires Wallet {
        assert!(exists<Wallet>(owner), E_WALLET_NOT_INITIALIZED);
        let wallet = borrow_global<Wallet>(owner);
        let balance = coin::balance<AptosCoin>(owner);
        (wallet.owner, wallet.total_sent, wallet.total_received, balance)
    }
}
