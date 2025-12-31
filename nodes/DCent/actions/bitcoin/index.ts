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
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex, "m/84'/0'/0'/0/0") as string;
      const address = await connectionManager.sendCommand<{ address: string; path: string }>(
        'getBitcoinAddress',
        { accountIndex, path: derivationPath },
      );
      return address;
    }

    case 'getAddresses': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const count = 10;
      const addresses = await connectionManager.sendCommand<{
        addresses: Array<{ address: string; path: string; index: number }>;
      }>('getBitcoinAddresses', { accountIndex, count });
      return addresses;
    }

    case 'getXpub': {
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex, "m/84'/0'/0'") as string;
      const result = await connectionManager.sendCommand<{
        xpub: string;
        path: string;
        type: string;
      }>('getBitcoinXpub', { path: derivationPath });
      return result;
    }

    case 'createTx': {
      const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const tx = await connectionManager.sendCommand<{
        txHex: string;
        fee: string;
        inputs: number;
        outputs: number;
      }>('createBitcoinTransaction', { to: toAddress, amount });
      return tx;
    }

    case 'signTx': {
      const txHex = this.getNodeParameter('txHex', itemIndex) as string;
      const signed = await connectionManager.sendCommand<{
        signedTx: string;
        txId: string;
      }>('signBitcoinTransaction', { txHex });
      return signed;
    }

    case 'signPsbt': {
      const psbt = this.getNodeParameter('psbt', itemIndex) as string;
      const signed = await connectionManager.sendCommand<{
        signedPsbt: string;
        complete: boolean;
      }>('signBitcoinPsbt', { psbt });
      return signed;
    }

    case 'getUtxo': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const utxos = await connectionManager.sendCommand<{
        utxos: Array<{
          txId: string;
          vout: number;
          value: string;
          confirmations: number;
        }>;
      }>('getBitcoinUtxo', { address });
      return utxos;
    }

    case 'estimateFee': {
      const fee = await connectionManager.sendCommand<{
        slow: string;
        medium: string;
        fast: string;
        unit: string;
      }>('estimateBitcoinFee');
      return fee;
    }

    case 'broadcast': {
      const txHex = this.getNodeParameter('txHex', itemIndex) as string;
      const result = await connectionManager.sendCommand<{ txId: string; success: boolean }>(
        'broadcastBitcoinTransaction',
        { txHex },
      );
      return result;
    }

    case 'signMessage': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{
        signature: string;
        address: string;
      }>('signBitcoinMessage', { message, path: derivationPath });
      return signature;
    }

    case 'verifyMessage': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const signature = this.getNodeParameter('signature', itemIndex) as string;
      const address = this.getNodeParameter('address', itemIndex) as string;
      const result = await connectionManager.sendCommand<{ valid: boolean }>(
        'verifyBitcoinMessage',
        { message, signature, address },
      );
      return result;
    }

    case 'getSegwitAddress': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const address = await connectionManager.sendCommand<{ address: string; path: string }>(
        'getBitcoinAddress',
        { accountIndex, path: `m/84'/0'/${accountIndex}'/0/0` },
      );
      return { ...address, type: 'native-segwit' };
    }

    case 'getLegacyAddress': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const address = await connectionManager.sendCommand<{ address: string; path: string }>(
        'getBitcoinAddress',
        { accountIndex, path: `m/44'/0'/${accountIndex}'/0/0` },
      );
      return { ...address, type: 'legacy' };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
