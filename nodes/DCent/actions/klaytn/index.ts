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
      const address = await connectionManager.sendCommand<{ address: string; path: string }>(
        'getKlaytnAddress',
        { accountIndex },
      );
      return address;
    }

    case 'signTransaction': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const value = this.getNodeParameter('value', itemIndex) as string;
      const data = this.getNodeParameter('data', itemIndex, '0x') as string;
      const gasLimit = this.getNodeParameter('gasLimit', itemIndex, '21000') as string;
      const gasPrice = this.getNodeParameter('gasPrice', itemIndex) as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
      }>('signKlaytnTransaction', {
        to,
        value,
        data,
        gasLimit,
        gasPrice,
      });
      return signed;
    }

    case 'signMessage': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signKlaytnMessage', { message });
      return signature;
    }

    case 'sendKlay': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('sendKlay', { to, amount });
      return result;
    }

    case 'sendKip7Token': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('sendKip7Token', { tokenAddress, to, amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
