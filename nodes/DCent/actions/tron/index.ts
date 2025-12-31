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
        hexAddress: string;
        path: string;
      }>('getTronAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const data = this.getNodeParameter('data', itemIndex, '') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txId: string;
        signature: string;
      }>('signTronTransaction', { to, amount, data });
      return signed;
    }

    case 'sendTrx': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txId: string;
        signedTx: string;
      }>('sendTrx', { to, amount });
      return result;
    }

    case 'sendTrc20': {
      const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txId: string;
        signedTx: string;
      }>('sendTrc20Token', { contractAddress, to, amount });
      return result;
    }

    case 'getResources': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const resources = await connectionManager.sendCommand<{
        bandwidth: number;
        energy: number;
        frozenBalance: string;
      }>('getTronResources', { address });
      return resources;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
