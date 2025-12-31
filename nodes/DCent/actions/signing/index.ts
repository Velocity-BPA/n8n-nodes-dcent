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
    case 'signMessage': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const message = this.getNodeParameter('message', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
        messageHash: string;
      }>('signMessage', { coin, message, path: derivationPath });
      return signature;
    }

    case 'signTypedData': {
      const typedData = this.getNodeParameter('typedData', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signTypedData', { typedData: JSON.parse(typedData), path: derivationPath });
      return signature;
    }

    case 'signHash': {
      const hash = this.getNodeParameter('hash', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const signature = await connectionManager.sendCommand<{
        signature: string;
        r: string;
        s: string;
        v: number;
      }>('signHash', { hash, path: derivationPath });
      return signature;
    }

    case 'verifySignature': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const signature = this.getNodeParameter('signature', itemIndex) as string;
      const address = this.getNodeParameter('address', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        valid: boolean;
        recoveredAddress: string;
      }>('verifySignature', { message, signature, address });
      return result;
    }

    case 'personalSign': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('personalSign', { message, path: derivationPath });
      return signature;
    }

    case 'signEip712': {
      const domain = this.getNodeParameter('domain', itemIndex) as string;
      const types = this.getNodeParameter('types', itemIndex) as string;
      const value = this.getNodeParameter('value', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signEip712', {
        domain: JSON.parse(domain),
        types: JSON.parse(types),
        value: JSON.parse(value),
        path: derivationPath,
      });
      return signature;
    }

    case 'getPublicKey': {
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const publicKey = await connectionManager.sendCommand<{
        publicKey: string;
        chainCode: string;
        fingerprint: string;
      }>('getPublicKey', { path: derivationPath });
      return publicKey;
    }

    case 'deriveAddress': {
      const coin = this.getNodeParameter('coin', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      
      const address = await connectionManager.sendCommand<{
        address: string;
        publicKey: string;
        path: string;
      }>('deriveAddress', { coin, path: derivationPath });
      return address;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
