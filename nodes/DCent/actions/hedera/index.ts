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
        accountId: string;
      }>('getHederaAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const memo = this.getNodeParameter('memo', itemIndex, '') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        signature: string;
      }>('signHederaTransaction', { to, amount, memo });
      return signed;
    }

    case 'transfer': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('transferHbar', { to, amount });
      return result;
    }

    case 'sendToken': {
      const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('sendHederaToken', { tokenId, to, amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
