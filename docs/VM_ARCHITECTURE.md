# Cresca VM Architecture

## Overview
Cresca VM enables atomic cross-chain transaction execution with unified state management across Aptos, Solana, Base, and EVM chains.

## Architecture Components

### Block Monitor Service
- Monitors new blocks on supported chains
- Extracts transactions related to Cresca smart contracts
- Queues transactions for VM execution

### VM Execution Engine
- Isolated transaction execution environment
- Cross-chain routing and settlement
- Atomic rollback on failure

## Key Features
- **Atomic Cross-Chain Operations**: All-or-nothing execution
- **Unified State View**: Single balance across all chains
- **Security Isolation**: Sandboxed transaction execution
- **Automatic Rollback**: Failed transactions don't affect state

## Use Cases
1. Scheduled cross-chain payments
2. Multi-chain basket trading with 150x leverage
3. Automated DCA strategies across chains
4. Privacy-preserving stealth transactions
