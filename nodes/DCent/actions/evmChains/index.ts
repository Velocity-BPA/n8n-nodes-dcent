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
      const chain = this.getNodeParameter('evmChain', itemIndex, 'polygon') as string;
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const address = await connectionManager.sendCommand<{ address: string; path: string }>(
        'getEvmAddress',
        { chain, accountIndex },
      );
      return { ...address, chain };
    }

    case 'signTransaction': {
      const chain = this.getNodeParameter('evmChain', itemIndex, 'polygon') as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const value = this.getNodeParameter('value', itemIndex) as string;
      const data = this.getNodeParameter('data', itemIndex, '0x') as string;
      const gasLimit = this.getNodeParameter('gasLimit', itemIndex, '21000') as string;
      const maxFeePerGas = this.getNodeParameter('maxFeePerGas', itemIndex) as string;
      const maxPriorityFeePerGas = this.getNodeParameter('maxPriorityFeePerGas', itemIndex) as string;

      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txHash: string;
      }>('signEvmTransaction', {
        chain,
        to,
        value,
        data,
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      return signed;
    }

    case 'signMessage': {
      const chain = this.getNodeParameter('evmChain', itemIndex, 'polygon') as string;
      const message = this.getNodeParameter('message', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signEvmMessage', { chain, message });
      return signature;
    }

    case 'signTypedData': {
      const chain = this.getNodeParameter('evmChain', itemIndex, 'polygon') as string;
      const typedData = this.getNodeParameter('typedData', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signEvmTypedData', { chain, typedData: JSON.parse(typedData) });
      return signature;
    }

    case 'getChainInfo': {
      const chain = this.getNodeParameter('evmChain', itemIndex, 'polygon') as string;
      const info = await connectionManager.sendCommand<{
        chainId: number;
        name: string;
        rpcUrl: string;
        symbol: string;
        blockExplorer: string;
      }>('getEvmChainInfo', { chain });
      return info;
    }

    case 'getGasPrice': {
      const chain = this.getNodeParameter('evmChain', itemIndex, 'polygon') as string;
      const gasPrice = await connectionManager.sendCommand<{
        slow: string;
        standard: string;
        fast: string;
        baseFee: string;
      }>('getEvmGasPrice', { chain });
      return gasPrice;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
