module aptpays::calendar_payments {

    use std::signer;
    use std::vector;
    use std::event;
    use std::coin;
    use std::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_PAYER: u64 = 1;
    const E_SCHEDULE_NOT_FOUND: u64 = 2;
    const E_INACTIVE: u64 = 3;
    const E_NOT_DUE: u64 = 4;
    const E_INVALID_PARAMS: u64 = 5;
    const E_INSUFFICIENT_ESCROW: u64 = 6;

    /// One scheduled payment definition. Coins are escrowed at creation time.
    struct Schedule has store {
        recipient: address,
        amount: u64,
        next_exec_secs: u64,
        interval_secs: u64,        // 0 => one-time
        remaining_occurrences: u64,// for recurring: how many executions still planned; for one-time: 1
        active: bool,
        escrow: coin::Coin<AptosCoin>,
    }

    struct ScheduleEntry has store { id: u64, schedule: Schedule }

    /// Per-payer container for schedules and events
    struct Schedules has key {
        payer: address,
        next_id: u64,
        entries: vector<ScheduleEntry>,
        created_events: event::EventHandle<Created>,
        executed_events: event::EventHandle<Executed>,
        canceled_events: event::EventHandle<Canceled>,
    }

    struct Created has copy, drop, store { id: u64, recipient: address, amount: u64, first_exec_secs: u64, interval_secs: u64, occurrences: u64 }
    struct Executed has copy, drop, store { id: u64, recipient: address, amount: u64, executed_at: u64, remaining: u64 }
    struct Canceled has copy, drop, store { id: u64, refunded: u64 }

    /// Create a one-time payment to execute at or after `execute_at_secs`.
    /// Escrows `amount` APT immediately from the payer.
    public entry fun create_one_time(
        payer: &signer,
        recipient: address,
        amount: u64,
        execute_at_secs: u64
    ) acquires Schedules {
        assert!(amount > 0, E_INVALID_PARAMS);
    let now = timestamp::now_seconds();
        assert!(execute_at_secs >= now, E_INVALID_PARAMS);

    let escrow = coin::withdraw<AptosCoin>(payer, amount);
    let _ = add_schedule_internal(
            payer,
            recipient,
            amount,
            execute_at_secs,
            /* interval */ 0,
            /* occurrences */ 1,
            escrow
        );
        // emit Created as part of add_schedule_internal
        // return id (events only); clients can read from event or track next_id-1
    }

    /// Create a recurring payment starting at `first_exec_secs`, repeating every `interval_secs`.
    /// Escrows `amount * occurrences` APT immediately.
    public entry fun create_recurring(
        payer: &signer,
        recipient: address,
        amount: u64,
        first_exec_secs: u64,
        interval_secs: u64,
        occurrences: u64
    ) acquires Schedules {
        assert!(amount > 0, E_INVALID_PARAMS);
        assert!(interval_secs > 0, E_INVALID_PARAMS);
        assert!(occurrences > 0, E_INVALID_PARAMS);
    let now = timestamp::now_seconds();
        assert!(first_exec_secs >= now, E_INVALID_PARAMS);

        // total = amount * occurrences (basic overflow-safe check)
    let total = amount * occurrences;
        // If multiplication overflows, Move aborts; that's fine.
    let escrow = coin::withdraw<AptosCoin>(payer, total);
    let _ = add_schedule_internal(
            payer,
            recipient,
            amount,
            first_exec_secs,
            interval_secs,
            occurrences,
            escrow
        );
    }

    /// Cancel a schedule. Refunds all remaining escrow to the payer.
    public entry fun cancel(
        payer: &signer,
        schedule_id: u64
    ) acquires Schedules {
    let payer_addr = signer::address_of(payer);
    let schedules = borrow_global_mut<Schedules>(payer_addr);
        let (found, idx) = find_index(&schedules.entries, schedule_id);
        assert!(found, E_SCHEDULE_NOT_FOUND);

    let entry_ref = vector::borrow_mut(&mut schedules.entries, idx);
        assert!(entry_ref.schedule.active, E_INACTIVE);
        entry_ref.schedule.active = false;

    // Extract full escrow amount and refund to payer without moving out of the field
    let refund_amt = coin::value<AptosCoin>(&entry_ref.schedule.escrow);
    let refund = coin::extract<AptosCoin>(&mut entry_ref.schedule.escrow, refund_amt);
    coin::deposit<AptosCoin>(signer::address_of(payer), refund);

    event::emit_event(&mut schedules.canceled_events, Canceled { id: schedule_id, refunded: refund_amt });
    }

    /// Execute a due schedule. Anyone can call this; funds are paid from escrow.
    /// Requires: now >= next_exec_secs and schedule has enough escrow.
    public entry fun execute(
        _executor: &signer,
        payer_addr: address,
        schedule_id: u64
    ) acquires Schedules {
    let now = timestamp::now_seconds();
    let schedules = borrow_global_mut<Schedules>(payer_addr);
        let (found, idx) = find_index(&schedules.entries, schedule_id);
        assert!(found, E_SCHEDULE_NOT_FOUND);

        let entry_ref = vector::borrow_mut(&mut schedules.entries, idx);
        let s = &mut entry_ref.schedule;
        assert!(s.active, E_INACTIVE);
        assert!(now >= s.next_exec_secs, E_NOT_DUE);

    // Ensure sufficient escrow
    // extract amount from escrow and deposit to recipient
    let pay = coin::extract<AptosCoin>(&mut s.escrow, s.amount);
    // Note: recipient must have registered AptosCoin store
    coin::deposit<AptosCoin>(s.recipient, pay);

        // Update schedule
        if (s.interval_secs == 0) {
            // One-time; deactivate
            s.remaining_occurrences = 0;
            s.active = false;
        } else {
            // Recurring
            if (s.remaining_occurrences > 0) {
                s.remaining_occurrences = s.remaining_occurrences - 1;
            };
            if (s.remaining_occurrences == 0) {
                s.active = false;
            } else {
                s.next_exec_secs = s.next_exec_secs + s.interval_secs;
            };
        };

        event::emit_event(
            &mut schedules.executed_events,
            Executed { id: schedule_id, recipient: s.recipient, amount: s.amount, executed_at: now, remaining: s.remaining_occurrences }
        );
    }

    // View: returns (next_id, active_count)
    #[view]
    public fun get_summary(payer_addr: address): (u64, u64) acquires Schedules {
    if (!exists<Schedules>(payer_addr)) { return (0, 0) };
    let s = borrow_global<Schedules>(payer_addr);
        let total = vector::length(&s.entries);
        let active = 0;
        let i = 0;
        while (i < total) {
            let e_ref = vector::borrow(&s.entries, i);
            if (e_ref.schedule.active) { active = active + 1 };
            i = i + 1;
        };
        (s.next_id, active)
    }

    // View: returns (recipient, amount, next_exec_secs, interval_secs, remaining, active)
    #[view]
    public fun get_schedule(payer_addr: address, schedule_id: u64): (address, u64, u64, u64, u64, bool) acquires Schedules {
    assert!(exists<Schedules>(payer_addr), E_SCHEDULE_NOT_FOUND);
    let s = borrow_global<Schedules>(payer_addr);
        let (found, idx) = find_index(&s.entries, schedule_id);
        assert!(found, E_SCHEDULE_NOT_FOUND);
        let e = vector::borrow(&s.entries, idx);
        let sc = &e.schedule;
        (sc.recipient, sc.amount, sc.next_exec_secs, sc.interval_secs, sc.remaining_occurrences, sc.active)
    }

    // ---------------- internal helpers ----------------

    fun add_schedule_internal(
        payer: &signer,
        recipient: address,
        amount: u64,
        first_exec_secs: u64,
        interval_secs: u64,
        occurrences: u64,
        escrow: coin::Coin<AptosCoin>
    ): u64 acquires Schedules {
        let payer_addr = signer::address_of(payer);
        if (!exists<Schedules>(payer_addr)) {
            move_to(payer, Schedules {
                payer: payer_addr,
                next_id: 1,
                entries: vector::empty<ScheduleEntry>(),
                created_events: account::new_event_handle<Created>(payer),
                executed_events: account::new_event_handle<Executed>(payer),
                canceled_events: account::new_event_handle<Canceled>(payer),
            });
        };
    let s_ref = borrow_global_mut<Schedules>(payer_addr);
        let id = s_ref.next_id;
        s_ref.next_id = s_ref.next_id + 1;

        let schedule = Schedule {
            recipient,
            amount,
            next_exec_secs: first_exec_secs,
            interval_secs,
            remaining_occurrences: occurrences,
            active: true,
            escrow,
        };
        let entry = ScheduleEntry { id, schedule };
        vector::push_back(&mut s_ref.entries, entry);

        event::emit_event(&mut s_ref.created_events, Created { id, recipient, amount, first_exec_secs, interval_secs, occurrences });
        id
    }

    fun find_index(entries: &vector<ScheduleEntry>, id: u64): (bool, u64) {
        let len = vector::length(entries);
        let i = 0;
        while (i < len) {
            let e = vector::borrow(entries, i);
            if (e.id == id) { return (true, i) };
            i = i + 1;
        };
        (false, 0)
    }
}
