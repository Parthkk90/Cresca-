module aptpays::simple_transfer {

    use std::signer;
    use std::coin;
    use std::aptos_coin::AptosCoin;
    use std::event;
    use aptos_framework::account;

    /// Wallet resource to track transactions
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
    }

    struct ReceiveEvent has copy, drop, store {
        from: address,
        amount: u64,
    }

    /// 🚀 ALL-IN-ONE FUNCTION: Auto-initialize + Transfer
    /// This is the ONLY function you need to call!
    /// No need to call init_wallet separately!
    public entry fun transfer(sender: &signer, to: address, amount: u64) acquires Wallet {
        let sender_addr = signer::address_of(sender);
        
        // Auto-initialize sender's wallet if it doesn't exist
        if (!exists<Wallet>(sender_addr)) {
            move_to(sender, Wallet {
                owner: sender_addr,
                total_sent: 0,
                total_received: 0,
                send_events: account::new_event_handle<SendEvent>(sender),
                receive_events: account::new_event_handle<ReceiveEvent>(sender),
            });
        };
        
        // Transfer the actual coins
        coin::transfer<AptosCoin>(sender, to, amount);
        
        // Update sender's wallet tracking
        let sender_wallet = borrow_global_mut<Wallet>(sender_addr);
        sender_wallet.total_sent = sender_wallet.total_sent + amount;
        event::emit_event(&mut sender_wallet.send_events, SendEvent { to, amount });
        
        // Auto-update receiver's wallet if they have one
        if (exists<Wallet>(to)) {
            let receiver_wallet = borrow_global_mut<Wallet>(to);
            receiver_wallet.total_received = receiver_wallet.total_received + amount;
            event::emit_event(&mut receiver_wallet.receive_events, ReceiveEvent { from: sender_addr, amount });
        };
    }

    // View wallet stats (returns 0,0 if wallet doesn't exist)
    #[view]
    public fun get_stats(owner: address): (u64, u64) acquires Wallet {
        if (!exists<Wallet>(owner)) {
            return (0, 0)
        };
        let wallet = borrow_global<Wallet>(owner);
        (wallet.total_sent, wallet.total_received)
    }

    // Check if wallet exists
    #[view]
    public fun has_wallet(owner: address): bool {
        exists<Wallet>(owner)
    }
}
