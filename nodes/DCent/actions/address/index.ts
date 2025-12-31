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
    case 'validate': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        valid: boolean;
        format: string;
        checksum: boolean;
      }>('validateAddress', { address, coin });
      return result;
    }

    case 'toChecksum': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        checksumAddress: string;
      }>('toChecksumAddress', { address });
      return result;
    }

    case 'derive': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const address = await connectionManager.sendCommand<{
        address: string;
        publicKey: string;
        path: string;
      }>('deriveAddress', { coin, path: derivationPath });
      return address;
    }

    case 'getFromDevice': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const showOnDevice = this.getNodeParameter('showOnDevice', itemIndex, true) as boolean;
      
      const address = await connectionManager.sendCommand<{
        address: string;
        path: string;
        confirmed: boolean;
      }>('getAddressFromDevice', { coin, accountIndex, showOnDevice });
      return address;
    }

    case 'batchDerive': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const startIndex = this.getNodeParameter('startIndex', itemIndex, 0) as number;
      const count = this.getNodeParameter('count', itemIndex, 10) as number;
      
      const addresses = await connectionManager.sendCommand<{
        addresses: Array<{
          address: string;
          path: string;
          index: number;
        }>;
      }>('batchDeriveAddresses', { coin, startIndex, count });
      return addresses;
    }

    case 'compare': {
      const address1 = this.getNodeParameter('address1', itemIndex) as string;
      const address2 = this.getNodeParameter('address2', itemIndex) as string;
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        match: boolean;
        normalized1: string;
        normalized2: string;
      }>('compareAddresses', { address1, address2, coin });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
