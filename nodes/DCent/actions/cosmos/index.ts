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
      const prefix = this.getNodeParameter('prefix', itemIndex, 'cosmos') as string;
      const address = await connectionManager.sendCommand<{
        address: string;
        publicKey: string;
        path: string;
      }>('getCosmosAddress', { accountIndex, prefix });
      return address;
    }

    case 'signTransaction': {
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const denom = this.getNodeParameter('denom', itemIndex, 'uatom') as string;
      const memo = this.getNodeParameter('memo', itemIndex, '') as string;
      const fee = this.getNodeParameter('fee', itemIndex) as string;
      const gas = this.getNodeParameter('gas', itemIndex, '200000') as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        signature: string;
      }>('signCosmosTransaction', { to, amount, denom, memo, fee, gas });
      return signed;
    }

    case 'delegate': {
      const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('delegateCosmos', { validatorAddress, amount });
      return result;
    }

    case 'undelegate': {
      const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('undelegateCosmos', { validatorAddress, amount });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
