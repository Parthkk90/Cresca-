// Cresca VM Main Entry Point
require('dotenv').config();
const BlockMonitor = require('./BlockMonitor');
const CrescaVM = require('./CrescaVM');

// Configuration
const config = {
    contractAddresses: [
        "0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606", // Calendar Payments
        "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"  // Bucket Protocol V1
    ]
};

// Initialize components
const vm = new CrescaVM();
const monitor = new BlockMonitor(config);

// Start the system
async function start() {
    console.log("🚀 Starting Cresca VM System...");
    console.log("═══════════════════════════════════");
    
    try {
        // Setup VM
        await vm.setup();
        
        // Start block monitor
        await monitor.start();
        
    } catch (error) {
        console.error("❌ Startup failed:", error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log("\n🛑 Shutting down gracefully...");
    monitor.stop();
    await vm.stop();
    process.exit(0);
});

// Run
if (require.main === module) {
    start();
}

module.exports = { CrescaVM, BlockMonitor };
