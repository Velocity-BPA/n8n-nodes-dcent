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
      const network = this.getNodeParameter('network', itemIndex, 'polkadot') as string;
      const address = await connectionManager.sendCommand<{
        address: string;
        publicKey: string;
        path: string;
        ss58Format: number;
      }>('getPolkadotAddress', { accountIndex, network });
      return address;
    }

    case 'signTransaction': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const network = this.getNodeParameter('network', itemIndex, 'polkadot') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        signature: string;
      }>('signPolkadotTransaction', { to, amount, network });
      return signed;
    }

    case 'stake': {
      const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('stakePolkadot', { validatorAddress, amount });
      return result;
    }

    case 'unstake': {
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
        unbondingPeriod: number;
      }>('unstakePolkadot', { amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
