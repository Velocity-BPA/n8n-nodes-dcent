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
    case 'getAddress': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const address = await connectionManager.sendCommand<{
        address: string;
        path: string;
        classicAddress: string;
        xAddress: string;
      }>('getXrpAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const destination = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const destinationTag = this.getNodeParameter('destinationTag', itemIndex, null) as number | null;
      const fee = this.getNodeParameter('fee', itemIndex, '12') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        txBlob: string;
      }>('signXrpTransaction', {
        destination,
        amount,
        destinationTag,
        fee,
      });
      return signed;
    }

    case 'signPayment': {
      const destination = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const memo = this.getNodeParameter('memo', itemIndex, '') as string;
      
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
      }>('signXrpPayment', { destination, amount, memo });
      return signed;
    }

    case 'getBalance': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const balance = await connectionManager.sendCommand<{
        balance: string;
        reserve: string;
        available: string;
      }>('getXrpBalance', { address });
      return balance;
    }

    case 'broadcast': {
      const txBlob = this.getNodeParameter('txBlob', itemIndex) as string;
      const result = await connectionManager.sendCommand<{
        txHash: string;
        success: boolean;
        resultCode: string;
      }>('broadcastXrpTransaction', { txBlob });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
