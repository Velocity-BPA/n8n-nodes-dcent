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
    case 'getBalance': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const balance = await connectionManager.sendCommand<{
        balance: string;
        decimals: number;
        symbol: string;
      }>('getTokenBalance', { tokenAddress, ownerAddress, chain });
      return balance;
    }

    case 'transfer': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('transferToken', { tokenAddress, to, amount, chain });
      return result;
    }

    case 'approve': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const spender = this.getNodeParameter('spender', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('approveToken', { tokenAddress, spender, amount, chain });
      return result;
    }

    case 'getAllowance': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const owner = this.getNodeParameter('ownerAddress', itemIndex) as string;
      const spender = this.getNodeParameter('spender', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const allowance = await connectionManager.sendCommand<{
        allowance: string;
        symbol: string;
      }>('getTokenAllowance', { tokenAddress, owner, spender, chain });
      return allowance;
    }

    case 'getInfo': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const info = await connectionManager.sendCommand<{
        name: string;
        symbol: string;
        decimals: number;
        totalSupply: string;
      }>('getTokenInfo', { tokenAddress, chain });
      return info;
    }

    case 'signPermit': {
      const tokenAddress = this.getNodeParameter('tokenAddress', itemIndex) as string;
      const spender = this.getNodeParameter('spender', itemIndex) as string;
      const value = this.getNodeParameter('value', itemIndex) as string;
      const deadline = this.getNodeParameter('deadline', itemIndex) as number;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const permit = await connectionManager.sendCommand<{
        signature: string;
        v: number;
        r: string;
        s: string;
      }>('signTokenPermit', { tokenAddress, spender, value, deadline, chain });
      return permit;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
