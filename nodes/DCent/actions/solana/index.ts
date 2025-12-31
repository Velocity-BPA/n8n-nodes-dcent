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
      }>('getSolanaAddress', { accountIndex });
      return address;
    }

    case 'signTransaction': {
      const serializedTx = this.getNodeParameter('serializedTx', itemIndex) as string;
      
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        signature: string;
      }>('signSolanaTransaction', { serializedTx });
      return signed;
    }

    case 'transfer': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
        signature: string;
      }>('transferSolana', { to, amount });
      return result;
    }

    case 'signMessage': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      
      const signature = await connectionManager.sendCommand<{
        signature: string;
        publicKey: string;
      }>('signSolanaMessage', { message });
      return signature;
    }

    case 'sendSplToken': {
      const tokenMint = this.getNodeParameter('tokenMint', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('sendSplToken', { tokenMint, to, amount });
      return result;
    }

    case 'stake': {
      const voteAccount = this.getNodeParameter('voteAccount', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        stakeAccount: string;
      }>('stakeSolana', { voteAccount, amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
