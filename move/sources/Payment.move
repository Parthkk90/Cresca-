module aptpays_addr::Payment {
    use std::signer;
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINSUFFICIENT_BALANCE: u64 = 2;
    const EORDER_NOT_FOUND: u64 = 3;
    const EORDER_ALREADY_PAID: u64 = 4;
    const EINVALID_AMOUNT: u64 = 5;

    /// Payment event emitted when a payment is made
    struct PaymentEvent has drop, store {
        order_id: vector<u8>,
        payer: address,
        merchant: address,
        amount: u64,
        timestamp: u64,
    }

    /// Refund event emitted when a refund is processed
    struct RefundEvent has drop, store {
        order_id: vector<u8>,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    /// Withdrawal event for merchant payouts
    struct WithdrawalEvent has drop, store {
        merchant: address,
        amount: u64,
        timestamp: u64,
    }

    /// Payment escrow resource
    struct PaymentEscrow has key {
        balance: u64,
        payment_events: EventHandle<PaymentEvent>,
        refund_events: EventHandle<RefundEvent>,
        withdrawal_events: EventHandle<WithdrawalEvent>,
    }

    /// Order tracking
    struct Order has store, drop {
        order_id: vector<u8>,
        merchant: address,
        amount: u64,
        paid: bool,
        refunded: bool,
    }

    /// Orders registry
    struct OrderRegistry has key {
        orders: vector<Order>,
    }

    /// Merchant info
    struct Merchant has key {
        owner: address,
        balance: u64,
        total_received: u64,
        total_withdrawn: u64,
    }

    /// Initialize the payment module
    public entry fun initialize(acc: &signer) {
        let account_addr = signer::address_of(acc);
        
        if (!exists<PaymentEscrow>(account_addr)) {
            move_to(acc, PaymentEscrow {
                balance: 0,
                payment_events: account::new_event_handle<PaymentEvent>(acc),
                refund_events: account::new_event_handle<RefundEvent>(acc),
                withdrawal_events: account::new_event_handle<WithdrawalEvent>(acc),
            });
        };

        if (!exists<OrderRegistry>(account_addr)) {
            move_to(acc, OrderRegistry {
                orders: vector::empty<Order>(),
            });
        };
    }

    /// Register a merchant
    public entry fun register_merchant(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<Merchant>(account_addr)) {
            move_to(account, Merchant {
                owner: account_addr,
                balance: 0,
                total_received: 0,
                total_withdrawn: 0,
            });
        };
    }

    /// Create a payment (from payer to escrow)
    public entry fun create_payment(
        payer: &signer,
        order_id: vector<u8>,
        merchant: address,
        amount: u64,
        escrow_addr: address,
    ) acquires PaymentEscrow, Merchant {
        assert!(amount > 0, EINVALID_AMOUNT);

        // Transfer coins from payer to escrow
        let coins = coin::withdraw<AptosCoin>(payer, amount);
        coin::deposit(escrow_addr, coins);

        // Update escrow balance
        let escrow = borrow_global_mut<PaymentEscrow>(escrow_addr);
        escrow.balance = escrow.balance + amount;

        // Update merchant balance
        if (exists<Merchant>(merchant)) {
            let merchant_info = borrow_global_mut<Merchant>(merchant);
            merchant_info.balance = merchant_info.balance + amount;
            merchant_info.total_received = merchant_info.total_received + amount;
        };

        // Emit payment event
        event::emit_event(&mut escrow.payment_events, PaymentEvent {
            order_id,
            payer: signer::address_of(payer),
            merchant,
            amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Withdraw funds (merchant payout)
    public entry fun withdraw(
        merchant: &signer,
        escrow_addr: address,
        amount: u64,
    ) acquires PaymentEscrow, Merchant {
        let merchant_addr = signer::address_of(merchant);
        
        // Check merchant balance
        let merchant_info = borrow_global_mut<Merchant>(merchant_addr);
        assert!(merchant_info.balance >= amount, EINSUFFICIENT_BALANCE);

        // Update balances
        merchant_info.balance = merchant_info.balance - amount;
        merchant_info.total_withdrawn = merchant_info.total_withdrawn + amount;

        let escrow = borrow_global_mut<PaymentEscrow>(escrow_addr);
        assert!(escrow.balance >= amount, EINSUFFICIENT_BALANCE);
        escrow.balance = escrow.balance - amount;

        // Transfer coins
        let coins = coin::withdraw<AptosCoin>(merchant, amount);
        coin::deposit(merchant_addr, coins);

        // Emit withdrawal event
        event::emit_event(&mut escrow.withdrawal_events, WithdrawalEvent {
            merchant: merchant_addr,
            amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Refund a payment
    public entry fun refund(
        admin: &signer,
        order_id: vector<u8>,
        recipient: address,
        amount: u64,
        escrow_addr: address,
    ) acquires PaymentEscrow {
        // Only escrow owner can refund
        assert!(signer::address_of(admin) == escrow_addr, ENOT_AUTHORIZED);

        let escrow = borrow_global_mut<PaymentEscrow>(escrow_addr);
        assert!(escrow.balance >= amount, EINSUFFICIENT_BALANCE);

        escrow.balance = escrow.balance - amount;

        // Transfer refund
        let coins = coin::withdraw<AptosCoin>(admin, amount);
        coin::deposit(recipient, coins);

        // Emit refund event
        event::emit_event(&mut escrow.refund_events, RefundEvent {
            order_id,
            recipient,
            amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// View functions
    #[view]
    public fun get_escrow_balance(escrow_addr: address): u64 acquires PaymentEscrow {
        if (exists<PaymentEscrow>(escrow_addr)) {
            borrow_global<PaymentEscrow>(escrow_addr).balance
        } else {
            0
        }
    }

    #[view]
    public fun get_merchant_balance(merchant_addr: address): u64 acquires Merchant {
        if (exists<Merchant>(merchant_addr)) {
            borrow_global<Merchant>(merchant_addr).balance
        } else {
            0
        }
    }
}
