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
    case 'build': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const data = this.getNodeParameter('data', itemIndex, '') as string;
      
      const tx = await connectionManager.sendCommand<{
        unsignedTx: string;
        estimatedFee: string;
        nonce?: number;
      }>('buildTransaction', { coin, to, amount, data });
      return tx;
    }

    case 'sign': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const unsignedTx = this.getNodeParameter('unsignedTx', itemIndex) as string;
      
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        signature: string;
      }>('signTransaction', { coin, unsignedTx });
      return signed;
    }

    case 'broadcast': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const signedTx = this.getNodeParameter('signedTx', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        success: boolean;
      }>('broadcastTransaction', { coin, signedTx });
      return result;
    }

    case 'getStatus': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const txHash = this.getNodeParameter('txHash', itemIndex) as string;
      
      const status = await connectionManager.sendCommand<{
        status: string;
        confirmations: number;
        blockNumber?: number;
        timestamp?: number;
      }>('getTransactionStatus', { coin, txHash });
      return status;
    }

    case 'getHistory': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const address = this.getNodeParameter('address', itemIndex) as string;
      const limit = this.getNodeParameter('limit', itemIndex, 20) as number;
      
      const history = await connectionManager.sendCommand<{
        transactions: Array<{
          txHash: string;
          from: string;
          to: string;
          value: string;
          timestamp: number;
          status: string;
        }>;
      }>('getTransactionHistory', { coin, address, limit });
      return history;
    }

    case 'estimateFee': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const fee = await connectionManager.sendCommand<{
        slow: string;
        standard: string;
        fast: string;
        unit: string;
      }>('estimateTransactionFee', { coin, to, amount });
      return fee;
    }

    case 'decode': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const rawTx = this.getNodeParameter('rawTx', itemIndex) as string;
      
      const decoded = await connectionManager.sendCommand<{
        from: string;
        to: string;
        value: string;
        data: string;
        nonce?: number;
        fee?: string;
      }>('decodeTransaction', { coin, rawTx });
      return decoded;
    }

    case 'cancel': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const txHash = this.getNodeParameter('txHash', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        cancelTxHash: string;
        success: boolean;
      }>('cancelTransaction', { coin, txHash });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
