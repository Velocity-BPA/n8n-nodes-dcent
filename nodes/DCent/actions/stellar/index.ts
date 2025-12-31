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
        publicKey: string;
        path: string;
      }>('getStellarAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const destination = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const memo = this.getNodeParameter('memo', itemIndex, '') as string;
      const memoType = this.getNodeParameter('memoType', itemIndex, 'text') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        signature: string;
      }>('signStellarTransaction', {
        destination,
        amount,
        memo,
        memoType,
      });
      return signed;
    }

    case 'signPayment': {
      const destination = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const asset = this.getNodeParameter('asset', itemIndex, 'XLM') as string;
      
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
      }>('signStellarPayment', { destination, amount, asset });
      return signed;
    }

    case 'getBalance': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const balance = await connectionManager.sendCommand<{
        balances: Array<{
          asset: string;
          balance: string;
          issuer?: string;
        }>;
        sequence: string;
      }>('getStellarBalance', { address });
      return balance;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
