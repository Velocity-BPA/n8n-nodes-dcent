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
        'getEthereumAddress',
        { accountIndex },
      );
      return address;
    }

    case 'signTx':
    case 'signEip1559': {
      const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
        v: string;
        r: string;
        s: string;
      }>('signEthereumTransaction', {
        to: toAddress,
        value: amount,
        type: 2, // EIP-1559
      });
      return signed;
    }

    case 'signLegacy': {
      const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
      }>('signEthereumTransaction', {
        to: toAddress,
        value: amount,
        type: 0,
      });
      return signed;
    }

    case 'signMessage': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signEthereumMessage', { message });
      return signature;
    }

    case 'signPersonal': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signEthereumPersonalMessage', { message });
      return signature;
    }

    case 'signTypedData': {
      const typedData = this.getNodeParameter('typedData', itemIndex) as object;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signEthereumTypedData', { typedData });
      return signature;
    }

    case 'getBalance': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const balance = await connectionManager.sendCommand<{
        balance: string;
        balanceWei: string;
      }>('getEthereumBalance', { address });
      return { ...balance, symbol: 'ETH' };
    }

    case 'getTokenBalances': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const tokens = await connectionManager.sendCommand<{
        tokens: Array<{
          address: string;
          symbol: string;
          balance: string;
          decimals: number;
        }>;
      }>('getEthereumTokenBalances', { address });
      return tokens;
    }

    case 'getNonce': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const nonce = await connectionManager.sendCommand<{ nonce: number }>(
        'getEthereumNonce',
        { address },
      );
      return nonce;
    }

    case 'estimateGas': {
      const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const gas = await connectionManager.sendCommand<{
        gasLimit: string;
        gasPrice: string;
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
      }>('estimateEthereumGas', { to: toAddress, value: amount });
      return gas;
    }

    case 'broadcast': {
      const txHex = this.getNodeParameter('txHex', itemIndex) as string;
      const result = await connectionManager.sendCommand<{
        txHash: string;
        success: boolean;
      }>('broadcastEthereumTransaction', { signedTx: txHex });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
