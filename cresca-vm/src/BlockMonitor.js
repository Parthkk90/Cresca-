// Cresca VM Block Monitor
// Monitors blockchain for transactions and queues them for VM execution

const { Aptos, AptosConfig, Network } = require("@aptos-labs/ts-sdk");

class BlockMonitor {
    constructor(config) {
        this.aptosClient = new Aptos(new AptosConfig({ network: Network.TESTNET }));
        this.contractAddresses = config.contractAddresses || [];
        this.isRunning = false;
        this.lastProcessedVersion = 0;
    }

    async start() {
        console.log("🚀 Starting Cresca VM Block Monitor...");
        this.isRunning = true;
        await this.monitor();
    }

    async monitor() {
        while (this.isRunning) {
            try {
                // Get latest transactions
                const transactions = await this.aptosClient.getAccountTransactions({
                    accountAddress: this.contractAddresses[0],
                    options: { start: this.lastProcessedVersion }
                });

                // Process each transaction
                for (const tx of transactions) {
                    await this.procesTransaction(tx);
                    this.lastProcessedVersion = tx.version;
                }

                // Wait before next check
                await this.sleep(5000);
            } catch (error) {
                console.error("Monitor error:", error.message);
                await this.sleep(10000);
            }
        }
    }

    async procesTransaction(tx) {
        console.log(`📦 Processing transaction: ${tx.hash}`);
        
        // Extract relevant events
        const crescaEvents = this.extractCrescaEvents(tx);
        
        if (crescaEvents.length > 0) {
            // Queue for VM execution
            await this.queueForVM(tx, crescaEvents);
        }
    }

    extractCrescaEvents(tx) {
        const events = [];
        if (tx.events) {
            for (const event of tx.events) {
                if (this.contractAddresses.some(addr => event.type.includes(addr))) {
                    events.push(event);
                }
            }
        }
        return events;
    }

    async queueForVM(tx, events) {
        console.log(`✅ Queued ${events.length} events for VM execution`);
        // TODO: Implement VM queue integration
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        console.log("⏹️  Stopping Block Monitor...");
        this.isRunning = false;
    }
}

module.exports = BlockMonitor;
