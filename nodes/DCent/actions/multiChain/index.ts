/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { DCentConnectionManager } from '../../transport/connectionManager';

export async function execute(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<Record<string, unknown>> {
  const connectionManager = DCentConnectionManager.getInstance();

  switch (operation) {
    case 'getAddresses': {
      const coins = this.getNodeParameter('coins', itemIndex) as string[];
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      
      const addresses = await connectionManager.sendCommand<{
        addresses: Array<{
          coin: string;
          address: string;
          path: string;
        }>;
      }>('getMultiChainAddresses', { coins, accountIndex });
      return addresses;
    }

    case 'getSupportedCoins': {
      const coins = await connectionManager.sendCommand<{
        coins: Array<{
          symbol: string;
          name: string;
          network: string;
          decimals: number;
        }>;
      }>('getSupportedCoins');
      return coins;
    }

    case 'getBalances': {
      const coins = this.getNodeParameter('coins', itemIndex) as string[];
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      
      const balances = await connectionManager.sendCommand<{
        balances: Array<{
          coin: string;
          balance: string;
          value?: string;
        }>;
      }>('getMultiChainBalances', { coins, accountIndex });
      return balances;
    }

    case 'signMultiple': {
      const transactions = this.getNodeParameter('transactions', itemIndex) as string;
      
      const signed = await connectionManager.sendCommand<{
        signedTransactions: Array<{
          coin: string;
          signedTx: string;
          txHash: string;
        }>;
      }>('signMultipleTransactions', { transactions: JSON.parse(transactions) });
      return signed;
    }

    case 'getDerivationPaths': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      
      const paths = await connectionManager.sendCommand<{
        paths: Array<{
          type: string;
          path: string;
          description: string;
        }>;
      }>('getDerivationPaths', { coin });
      return paths;
    }

    case 'verifyAddresses': {
      const addresses = this.getNodeParameter('addresses', itemIndex) as string;
      
      const results = await connectionManager.sendCommand<{
        results: Array<{
          address: string;
          valid: boolean;
          coin: string;
        }>;
      }>('verifyAddresses', { addresses: JSON.parse(addresses) });
      return results;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
