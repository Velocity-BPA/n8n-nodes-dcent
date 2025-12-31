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
    case 'getAll': {
      const accounts = await connectionManager.sendCommand<{
        accounts: Array<{
          coin: string;
          address: string;
          balance: string;
          path: string;
        }>;
      }>('getAccounts');
      return accounts;
    }

    case 'getByCoin': {
      const coin = this.getNodeParameter('coin', itemIndex, 'BTC') as string;
      const account = await connectionManager.sendCommand<{
        coin: string;
        address: string;
        balance: string;
        path: string;
      }>('getAccountByCoin', { coin });
      return account;
    }

    case 'getAddress': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const address = await connectionManager.sendCommand<{ address: string }>(
        'getAccountAddress',
        { accountIndex },
      );
      return address;
    }

    case 'getXpub': {
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      const xpub = await connectionManager.sendCommand<{
        xpub: string;
        path: string;
      }>('getExtendedPublicKey', { path: derivationPath });
      return xpub;
    }

    case 'getBalance': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const balance = await connectionManager.sendCommand<{
        balance: string;
        pending: string;
        coin: string;
      }>('getAccountBalance', { accountIndex });
      return balance;
    }

    case 'create': {
      const coin = this.getNodeParameter('coin', itemIndex, 'BTC') as string;
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const account = await connectionManager.sendCommand<{
        coin: string;
        address: string;
        path: string;
      }>('createAccount', { coin, accountIndex });
      return account;
    }

    case 'sync': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const result = await connectionManager.sendCommand<{
        success: boolean;
        balance: string;
        transactions: number;
      }>('syncAccount', { accountIndex });
      return result;
    }

    case 'getInfo': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const info = await connectionManager.sendCommand<{
        coin: string;
        address: string;
        balance: string;
        path: string;
        transactionCount: number;
        createdAt: string;
      }>('getAccountInfo', { accountIndex });
      return info;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
