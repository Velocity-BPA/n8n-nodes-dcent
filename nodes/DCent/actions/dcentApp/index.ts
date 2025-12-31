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
    case 'getStatus': {
      const status = await connectionManager.sendCommand<{
        appVersion: string;
        connected: boolean;
        devicePaired: boolean;
        lastSync: string | null;
      }>('getDcentAppStatus');
      return status;
    }

    case 'sync': {
      const result = await connectionManager.sendCommand<{
        success: boolean;
        accountsSynced: number;
        lastSync: string;
      }>('syncDcentApp');
      return result;
    }

    case 'getAccounts': {
      const accounts = await connectionManager.sendCommand<{
        accounts: Array<{
          coin: string;
          address: string;
          label: string;
          balance: string;
        }>;
      }>('getDcentAppAccounts');
      return accounts;
    }

    case 'addAccount': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const label = this.getNodeParameter('label', itemIndex, '') as string;
      
      const account = await connectionManager.sendCommand<{
        address: string;
        coin: string;
        label: string;
        path: string;
      }>('addDcentAppAccount', { coin, label });
      return account;
    }

    case 'removeAccount': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
        removed: boolean;
      }>('removeDcentAppAccount', { address, coin });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
