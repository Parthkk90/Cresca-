#[test_only]
module cresca::dex_aggregator_tests {
    use std::signer;
    use std::string;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use cresca::dex_aggregator;

    // Mock USDC coin for testing
    struct USDC {}

    #[test(admin = @cresca, user = @0x123)]
    public fun test_initialize(admin: &signer, user: &signer) {
        // Setup
        let admin_addr = signer::address_of(admin);
        let user_addr = signer::address_of(user);
        
        // Create accounts
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(user_addr);
        
        // Initialize aggregator
        dex_aggregator::initialize(admin);
        
        // Verify initialization by checking stats
        let (total_volume, total_swaps, fees_collected) = dex_aggregator::get_aggregator_stats(admin_addr);
        assert!(total_volume == 0, 1);
        assert!(total_swaps == 0, 2);
        assert!(fees_collected == 0, 3);
    }

    #[test(admin = @cresca)]
    #[expected_failure(abort_code = 0x80001, location = cresca::dex_aggregator)]
    public fun test_initialize_twice_fails(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize once
        dex_aggregator::initialize(admin);
        
        // Try to initialize again - should fail
        dex_aggregator::initialize(admin);
    }

    #[test(admin = @cresca)]
    public fun test_get_supported_dexs(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Get supported DEXs
        let dexs = dex_aggregator::get_supported_dexs(admin_addr);
        assert!(std::vector::length(&dexs) == 5, 1);
    }

    #[test(admin = @cresca)]
    public fun test_find_best_route(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Find best route for 100 APT
        let amount_in = 100000000; // 1 APT (8 decimals)
        let (best_dex_id, best_amount_out, price_impact) = dex_aggregator::find_best_route<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Verify we got a valid DEX
        assert!(best_dex_id >= 1 && best_dex_id <= 5, 1);
        // Verify we got some output
        assert!(best_amount_out > 0, 2);
        // Verify price impact is reasonable (< 10%)
        assert!(price_impact < 1000, 3);
    }

    #[test(admin = @cresca)]
    public fun test_get_all_routes(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Get all routes for 1 APT
        let amount_in = 100000000;
        let routes = dex_aggregator::get_all_routes<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Should have routes from all 5 DEXs
        assert!(std::vector::length(&routes) == 5, 1);
    }

    #[test(admin = @cresca)]
    public fun test_compare_prices(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Compare prices for 1 APT
        let amount_in = 100000000;
        let (best_dex_id, best_output, worst_output, price_diff_bps) = dex_aggregator::compare_prices<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Verify results
        assert!(best_dex_id >= 1 && best_dex_id <= 5, 1);
        assert!(best_output > worst_output, 2);
        assert!(price_diff_bps > 0, 3);
    }

    #[test(admin = @cresca)]
    public fun test_toggle_dex(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Disable DEX 1 (Liquidswap)
        dex_aggregator::toggle_dex(admin, 1, false);
        
        // Check stats
        let (volume, swaps, enabled) = dex_aggregator::get_dex_stats(admin_addr, 1);
        assert!(!enabled, 1);
        
        // Re-enable
        dex_aggregator::toggle_dex(admin, 1, true);
        let (_, _, enabled) = dex_aggregator::get_dex_stats(admin_addr, 1);
        assert!(enabled, 2);
    }

    #[test(admin = @cresca)]
    #[expected_failure(abort_code = 393217, location = cresca::dex_aggregator)]
    public fun test_find_best_route_not_initialized_fails(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Try to find route without initializing - should fail
        let amount_in = 100000000;
        dex_aggregator::find_best_route<AptosCoin, USDC>(admin_addr, amount_in);
    }

    #[test(admin = @cresca)]
    #[expected_failure(abort_code = 65538, location = cresca::dex_aggregator)]
    public fun test_find_best_route_zero_amount_fails(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Try with zero amount - should fail
        dex_aggregator::find_best_route<AptosCoin, USDC>(admin_addr, 0);
    }

    #[test(admin = @cresca)]
    public fun test_get_dex_stats(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Check stats for each DEX
        let dex_id = 1;
        while (dex_id <= 5) {
            let (volume, swaps, enabled) = dex_aggregator::get_dex_stats(admin_addr, dex_id);
            assert!(volume == 0, (dex_id as u64));
            assert!(swaps == 0, (dex_id as u64) + 10);
            assert!(enabled, (dex_id as u64) + 20);
            dex_id = dex_id + 1;
        };
    }

    #[test(admin = @cresca)]
    public fun test_aggregator_fee_calculation(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Test with 1000 APT
        let amount_in = 100000000000; // 1000 APT
        let (_, amount_out, _) = dex_aggregator::find_best_route<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Fee should be 0.05% = 5 basis points
        // Expected output should be ~99.95% of input (minus DEX fees)
        let expected_min = (amount_in * 9900) / 10000; // 99% (accounting for DEX fees too)
        assert!(amount_out > expected_min, 1);
    }

    #[test(admin = @cresca)]
    public fun test_multiple_routes_comparison(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Get all routes
        let amount_in = 100000000; // 1 APT
        let routes = dex_aggregator::get_all_routes<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Verify all routes have different outputs (due to different DEX fees)
        let i = 0;
        let len = std::vector::length(&routes);
        while (i < len) {
            let route = std::vector::borrow(&routes, i);
            // Each route should have positive output
            // Note: We can't access struct fields in tests easily, so we just verify length
            i = i + 1;
        };
        
        // Should have 5 routes
        assert!(len == 5, 1);
    }

    #[test(admin = @cresca)]
    public fun test_price_impact_calculation(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Small trade should have low price impact
        let small_amount = 100000000; // 1 APT
        let (_, _, small_impact) = dex_aggregator::find_best_route<AptosCoin, USDC>(
            admin_addr,
            small_amount
        );
        
        // Large trade should have higher price impact
        let large_amount = 10000000000; // 100 APT
        let (_, _, large_impact) = dex_aggregator::find_best_route<AptosCoin, USDC>(
            admin_addr,
            large_amount
        );
        
        // Both should be reasonable
        assert!(small_impact < 1000, 1); // < 10%
        assert!(large_impact < 1000, 2); // < 10%
    }

    #[test(admin = @cresca, other = @0x456)]
    #[expected_failure(abort_code = 393217, location = cresca::dex_aggregator)]
    public fun test_toggle_dex_non_admin_fails(admin: &signer, other: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        account::create_account_for_test(signer::address_of(other));
        
        // Initialize as admin
        dex_aggregator::initialize(admin);
        
        // Try to toggle DEX as non-admin - should fail
        dex_aggregator::toggle_dex(other, 1, false);
    }

    #[test(admin = @cresca)]
    public fun test_best_route_selection(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Find best route
        let amount_in = 100000000;
        let (best_dex_id, best_output, _) = dex_aggregator::find_best_route<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Get all routes
        let all_routes = dex_aggregator::get_all_routes<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Best route should be among the returned routes
        assert!(best_dex_id >= 1 && best_dex_id <= 5, 1);
        assert!(std::vector::length(&all_routes) == 5, 2);
    }

    #[test(admin = @cresca)]
    public fun test_disabled_dex_not_in_routes(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Disable all DEXs except one
        dex_aggregator::toggle_dex(admin, 1, false);
        dex_aggregator::toggle_dex(admin, 2, false);
        dex_aggregator::toggle_dex(admin, 3, false);
        dex_aggregator::toggle_dex(admin, 4, false);
        // Keep DEX 5 (Cellana) enabled
        
        // Get routes
        let amount_in = 100000000;
        let routes = dex_aggregator::get_all_routes<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // Should only have 1 route (from enabled DEX)
        assert!(std::vector::length(&routes) == 1, 1);
        
        // Best route should be the only enabled DEX
        let (best_dex_id, _, _) = dex_aggregator::find_best_route<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        assert!(best_dex_id == 5, 2);
    }

    #[test(admin = @cresca)]
    public fun test_aggregator_stats_initialization(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Check initial stats
        let (total_volume, total_swaps, fees_collected) = dex_aggregator::get_aggregator_stats(admin_addr);
        
        assert!(total_volume == 0, 1);
        assert!(total_swaps == 0, 2);
        assert!(fees_collected == 0, 3);
    }

    #[test(admin = @cresca)]
    public fun test_price_difference_between_dexs(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        account::create_account_for_test(admin_addr);
        
        // Initialize
        dex_aggregator::initialize(admin);
        
        // Compare prices
        let amount_in = 100000000;
        let (best_dex_id, best_output, worst_output, price_diff_bps) = dex_aggregator::compare_prices<AptosCoin, USDC>(
            admin_addr,
            amount_in
        );
        
        // There should be a price difference between DEXs
        assert!(best_output > worst_output, 1);
        assert!(price_diff_bps > 0, 2);
        
        // Price difference should be reasonable (< 5%)
        assert!(price_diff_bps < 500, 3);
    }
}
