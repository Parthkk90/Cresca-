import {Aptos, AptosConfig, Network, Account} from 'aptos';
import * as Keychain from 'react-native-keychain';

const CONTRACT_ADDRESS = '0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf';

class AptosService {
  private aptos: Aptos;
  private config: AptosConfig;

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.config = new AptosConfig({
      network: network === 'mainnet' ? Network.MAINNET : Network.TESTNET,
    });
    this.aptos = new Aptos(this.config);
  }

  // Wallet management
  async createWallet(): Promise<{address: string; privateKey: string}> {
    const account = Account.generate();
    const privateKey = account.privateKey.toString();
    const address = account.accountAddress.toString();

    // Store securely in keychain
    await Keychain.setGenericPassword(address, privateKey, {
      service: 'aptpays-wallet',
    });

    return {address, privateKey};
  }

  async getStoredWallet(): Promise<{address: string; privateKey: string} | null> {
    const credentials = await Keychain.getGenericPassword({
      service: 'aptpays-wallet',
    });

    if (credentials) {
      return {
        address: credentials.username,
        privateKey: credentials.password,
      };
    }

    return null;
  }

  async deleteWallet(): Promise<void> {
    await Keychain.resetGenericPassword({service: 'aptpays-wallet'});
  }

  // Balance & account info
  async getBalance(address: string): Promise<number> {
    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: address,
      });

      const coinResource = resources.find(
        (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      if (coinResource) {
        return parseInt((coinResource.data as any).coin.value);
      }
      return 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  // Simple transfer
  async transfer(
    privateKey: string,
    recipient: string,
    amountInAPT: number
  ): Promise<string> {
    const account = Account.fromPrivateKey({privateKey});
    const amountOctas = Math.floor(amountInAPT * 100_000_000);

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::simple_transfer::transfer`,
        functionArguments: [recipient, amountOctas],
      },
    });

    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await this.aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return committedTxn.hash;
  }

  // Scheduled payments
  async createOneTimePayment(
    privateKey: string,
    recipient: string,
    amountInAPT: number,
    executeAtSeconds: number
  ): Promise<string> {
    const account = Account.fromPrivateKey({privateKey});
    const amountOctas = Math.floor(amountInAPT * 100_000_000);

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::calendar_payments::create_one_time`,
        functionArguments: [recipient, amountOctas, executeAtSeconds],
      },
    });

    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await this.aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return committedTxn.hash;
  }

  async createRecurringPayment(
    privateKey: string,
    recipient: string,
    amountInAPT: number,
    firstExecutionSeconds: number,
    intervalSeconds: number,
    occurrences: number
  ): Promise<string> {
    const account = Account.fromPrivateKey({privateKey});
    const amountOctas = Math.floor(amountInAPT * 100_000_000);

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::calendar_payments::create_recurring`,
        functionArguments: [
          recipient,
          amountOctas,
          firstExecutionSeconds,
          intervalSeconds,
          occurrences,
        ],
      },
    });

    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await this.aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return committedTxn.hash;
  }

  async cancelSchedule(privateKey: string, scheduleId: number): Promise<string> {
    const account = Account.fromPrivateKey({privateKey});

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::calendar_payments::cancel`,
        functionArguments: [scheduleId],
      },
    });

    const committedTxn = await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    await this.aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return committedTxn.hash;
  }

  async getScheduleSummary(address: string): Promise<{nextId: number; activeCount: number}> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::calendar_payments::get_summary`,
          functionArguments: [address],
        },
      });

      return {
        nextId: parseInt(result[0] as string),
        activeCount: parseInt(result[1] as string),
      };
    } catch (error) {
      return {nextId: 0, activeCount: 0};
    }
  }

  async getScheduleDetails(address: string, scheduleId: number): Promise<any> {
    const result = await this.aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::calendar_payments::get_schedule`,
        functionArguments: [address, scheduleId],
      },
    });

    return {
      recipient: result[0] as string,
      amount: parseInt(result[1] as string),
      nextExecSecs: parseInt(result[2] as string),
      intervalSecs: parseInt(result[3] as string),
      remainingOccurrences: parseInt(result[4] as string),
      active: result[5] as boolean,
    };
  }

  async getAllSchedules(address: string): Promise<any[]> {
    const {nextId} = await this.getScheduleSummary(address);
    
    if (nextId === 0) return [];

    const schedules = [];
    for (let id = 1; id < nextId; id++) {
      try {
        const schedule = await this.getScheduleDetails(address, id);
        schedules.push({id, ...schedule});
      } catch (error) {
        // Schedule might not exist, skip
      }
    }

    return schedules;
  }

  // Transaction history
  async getTransactions(address: string, limit: number = 25): Promise<any[]> {
    try {
      const response = await fetch(
        `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/transactions?limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
}

export default new AptosService();
