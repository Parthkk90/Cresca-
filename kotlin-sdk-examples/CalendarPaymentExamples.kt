package com.aptpays.examples

import com.aptpays.viewmodels.CalendarPaymentViewModel
import kotlinx.coroutines.runBlocking
import xyz.mcxross.kaptos.account.Account
import xyz.mcxross.kaptos.model.Ed25519PrivateKey

/**
 * Calendar Payment Examples - Simplified Integration
 * 
 * Only 3 functions to implement:
 * 1. createSchedule() - Universal create
 * 2. cancelSchedule() - Cancel payment
 * 3. executeSchedule() - Execute payment
 */

fun main() = runBlocking {
    // Setup account
    val privateKey = "YOUR_PRIVATE_KEY"
    val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
    
    val viewModel = CalendarPaymentViewModel(currentAccount = account)
    
    println("=== Calendar Payment Examples ===\n")
    
    // Example 1: One-time payment
    example1_OneTimePayment(viewModel)
    
    // Example 2: Recurring monthly payment
    example2_RecurringMonthly(viewModel)
    
    // Example 3: Weekly payments
    example3_WeeklyPayments(viewModel)
    
    // Example 4: Cancel payment
    example4_CancelPayment(viewModel)
    
    // Example 5: Execute payment
    example5_ExecutePayment(viewModel)
    
    // Example 6: View schedule details
    example6_ViewSchedule(viewModel)
}

/**
 * Example 1: One-time payment in 1 hour
 */
suspend fun example1_OneTimePayment(viewModel: CalendarPaymentViewModel) {
    println("=== Example 1: One-Time Payment ===")
    
    val executeAt = viewModel.getFutureTimestamp(hours = 1)
    
    viewModel.createSchedule(
        recipient = "0xRECIPIENT_ADDRESS",
        amountAPT = 5.0,
        executeAt = executeAt,
        isRecurring = false,
        occurrences = 1
    ).fold(
        onSuccess = { txHash ->
            println("✅ One-time payment created!")
            println("💰 Amount: 5 APT")
            println("⏰ Executes: ${viewModel.formatTimestamp(executeAt)}")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 2: Monthly recurring payment for 12 months
 */
suspend fun example2_RecurringMonthly(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 2: Recurring Monthly Payment ===")
    
    val startAt = viewModel.getFutureTimestamp(days = 1)
    
    viewModel.createSchedule(
        recipient = "0xRECIPIENT_ADDRESS",
        amountAPT = 10.0,
        executeAt = startAt,
        isRecurring = true,
        intervalDays = 30,
        occurrences = 12
    ).fold(
        onSuccess = { txHash ->
            println("✅ Monthly payment created!")
            println("💰 Amount: 10 APT per month")
            println("📅 Duration: 12 months")
            println("💵 Total Escrow: 120 APT")
            println("⏰ Starts: ${viewModel.formatTimestamp(startAt)}")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 3: Weekly payments for 4 weeks
 */
suspend fun example3_WeeklyPayments(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 3: Weekly Payments ===")
    
    val startAt = viewModel.getFutureTimestamp(days = 1)
    
    viewModel.createSchedule(
        recipient = "0xRECIPIENT_ADDRESS",
        amountAPT = 2.5,
        executeAt = startAt,
        isRecurring = true,
        intervalDays = 7,
        occurrences = 4
    ).fold(
        onSuccess = { txHash ->
            println("✅ Weekly payment created!")
            println("💰 Amount: 2.5 APT per week")
            println("📅 Duration: 4 weeks")
            println("💵 Total Escrow: 10 APT")
            println("⏰ Starts: ${viewModel.formatTimestamp(startAt)}")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 4: Cancel a scheduled payment
 */
suspend fun example4_CancelPayment(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 4: Cancel Payment ===")
    
    viewModel.cancelSchedule(scheduleId = 0).fold(
        onSuccess = { txHash ->
            println("✅ Payment cancelled!")
            println("💰 Remaining escrow refunded")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 5: Execute a due payment (anyone can call)
 */
suspend fun example5_ExecutePayment(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 5: Execute Payment ===")
    
    viewModel.executeSchedule(
        payerAddress = "0xPAYER_ADDRESS",
        scheduleId = 0
    ).fold(
        onSuccess = { txHash ->
            println("✅ Payment executed!")
            println("💸 Funds transferred to recipient")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 6: View schedule details
 */
suspend fun example6_ViewSchedule(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 6: View Schedule ===")
    
    viewModel.getSchedule(
        payerAddress = "0xPAYER_ADDRESS",
        scheduleId = 0
    ).fold(
        onSuccess = { schedule ->
            println("✅ Schedule found!")
            println("📊 Details:")
            println("  👤 Recipient: ${schedule.recipient}")
            println("  💰 Amount: ${schedule.amountAPT} APT")
            println("  ⏰ Next Execution: ${schedule.nextExecutionDate}")
            println("  🔁 Type: ${if (schedule.isRecurring) "Recurring" else "One-time"}")
            if (schedule.isRecurring) {
                println("  📅 Interval: ${schedule.intervalDays} days")
                println("  🔢 Remaining: ${schedule.remainingOccurrences} payments")
            }
            println("  ✅ Active: ${schedule.isActive}")
            println("  🎯 Due: ${if (schedule.isDue) "Yes" else "No"}")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 7: Helper - Using convenience methods
 */
suspend fun example7_ConvenienceMethods(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 7: Convenience Methods ===")
    
    // Easy one-time payment
    viewModel.createOneTimePayment(
        recipient = "0xRECIPIENT",
        amountAPT = 5.0,
        executeAt = viewModel.getFutureTimestamp(hours = 24)
    ).fold(
        onSuccess = { println("✅ One-time payment created!") },
        onFailure = { println("❌ Error: ${it.message}") }
    )
    
    // Easy recurring payment
    viewModel.createRecurringPayment(
        recipient = "0xRECIPIENT",
        amountAPT = 10.0,
        startAt = viewModel.getFutureTimestamp(days = 1),
        intervalDays = 30,
        occurrences = 12
    ).fold(
        onSuccess = { println("✅ Recurring payment created!") },
        onFailure = { println("❌ Error: ${it.message}") }
    )
}

/**
 * Example 8: Complete workflow - Create, Check, Execute
 */
suspend fun example8_CompleteWorkflow(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 8: Complete Workflow ===")
    
    // 1. Create payment (executes in 5 minutes for testing)
    println("1️⃣ Creating payment...")
    val executeAt = viewModel.getFutureTimestamp(minutes = 5)
    
    viewModel.createSchedule(
        recipient = "0xRECIPIENT",
        amountAPT = 1.0,
        executeAt = executeAt,
        isRecurring = false,
        occurrences = 1
    ).getOrNull()
    
    println("✅ Payment created (executes in 5 minutes)")
    
    // 2. View details
    println("\n2️⃣ Checking details...")
    val schedule = viewModel.getSchedule("0xPAYER", 0).getOrNull()
    println("✅ Schedule ID: 0")
    println("   Amount: ${schedule?.amountAPT} APT")
    println("   Due: ${schedule?.isDue}")
    
    // 3. Wait and execute (in real app, use timer or manual trigger)
    println("\n3️⃣ Waiting for execution time...")
    println("   (In production, use WorkManager or AlarmManager)")
    
    // 4. Execute payment
    println("\n4️⃣ Executing payment...")
    viewModel.executeSchedule("0xPAYER", 0).fold(
        onSuccess = { println("✅ Payment executed successfully!") },
        onFailure = { println("⏳ Not due yet or already executed") }
    )
}

/**
 * Example 9: UI Integration Example
 */
suspend fun example9_UIIntegration(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 9: UI Integration ===")
    
    // Collect UI state
    viewModel.uiState.collect { state ->
        when {
            state.isLoading -> println("⏳ Loading...")
            state.error != null -> println("❌ Error: ${state.error}")
            state.lastScheduleCreated != null -> {
                val info = state.lastScheduleCreated
                println("✅ Payment Created!")
                println("   Recipient: ${info.recipient}")
                println("   Amount: ${info.amountAPT} APT")
                println("   Total Escrow: ${info.totalEscrowAPT} APT")
                println("   Type: ${if (info.isRecurring) "Recurring" else "One-time"}")
            }
        }
    }
}

/**
 * Example 10: Real-world use cases
 */
suspend fun example10_RealWorldUseCases(viewModel: CalendarPaymentViewModel) {
    println("\n=== Example 10: Real-World Use Cases ===")
    
    // Use Case 1: Salary payment (monthly, 12 months)
    println("💼 Use Case 1: Monthly Salary")
    viewModel.createRecurringPayment(
        recipient = "0xEMPLOYEE",
        amountAPT = 50.0,
        startAt = viewModel.getFutureTimestamp(days = 1),
        intervalDays = 30,
        occurrences = 12
    )
    println("✅ Created: 50 APT/month × 12 months = 600 APT escrowed")
    
    // Use Case 2: Rent payment (monthly, 6 months)
    println("\n🏠 Use Case 2: Rent Payment")
    viewModel.createRecurringPayment(
        recipient = "0xLANDLORD",
        amountAPT = 20.0,
        startAt = viewModel.getFutureTimestamp(days = 30),
        intervalDays = 30,
        occurrences = 6
    )
    println("✅ Created: 20 APT/month × 6 months = 120 APT escrowed")
    
    // Use Case 3: Subscription (weekly, 4 weeks)
    println("\n📱 Use Case 3: Weekly Subscription")
    viewModel.createRecurringPayment(
        recipient = "0xSERVICE",
        amountAPT = 0.5,
        startAt = viewModel.getFutureTimestamp(days = 7),
        intervalDays = 7,
        occurrences = 4
    )
    println("✅ Created: 0.5 APT/week × 4 weeks = 2 APT escrowed")
    
    // Use Case 4: Future payment (one-time)
    println("\n🎁 Use Case 4: Future Gift")
    viewModel.createOneTimePayment(
        recipient = "0xFRIEND",
        amountAPT = 10.0,
        executeAt = viewModel.getFutureTimestamp(days = 365)
    )
    println("✅ Created: 10 APT gift in 1 year")
}
