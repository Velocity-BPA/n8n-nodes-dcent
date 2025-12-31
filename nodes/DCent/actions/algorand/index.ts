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
      }>('getAlgorandAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const note = this.getNodeParameter('note', itemIndex, '') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txId: string;
        signature: string;
      }>('signAlgorandTransaction', { to, amount, note });
      return signed;
    }

    case 'transfer': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txId: string;
        signedTx: string;
      }>('transferAlgo', { to, amount });
      return result;
    }

    case 'sendAsa': {
      const assetId = this.getNodeParameter('assetId', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txId: string;
        signedTx: string;
      }>('sendAlgorandAsset', { assetId, to, amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
