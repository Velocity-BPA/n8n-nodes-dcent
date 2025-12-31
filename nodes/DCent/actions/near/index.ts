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
        implicitAccountId: string;
      }>('getNearAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const receiverId = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const actions = this.getNodeParameter('actions', itemIndex, 'transfer') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        signature: string;
      }>('signNearTransaction', { receiverId, amount, actions });
      return signed;
    }

    case 'transfer': {
      const receiverId = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('transferNear', { receiverId, amount });
      return result;
    }

    case 'stake': {
      const validatorId = this.getNodeParameter('validatorId', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('stakeNear', { validatorId, amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
