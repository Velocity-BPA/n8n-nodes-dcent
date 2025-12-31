/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { DCentConnectionManager } from '../../transport/connectionManager';
import { getCoinConfig, type CoinType } from '../../constants/coins';

export async function execute(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<Record<string, unknown>> {
  const connectionManager = DCentConnectionManager.getInstance();
  const coin = this.getNodeParameter('coin', itemIndex) as CoinType;
  const coinConfig = getCoinConfig(coin);

  if (!coinConfig) {
    throw new Error(`Unsupported coin: ${coin}`);
  }

  switch (operation) {
    case 'getAddress': {
      const accountIndex = this.getNodeParameter('accountIndex', itemIndex, 0) as number;
      const address = await connectionManager.sendCommand<{ address: string; path: string }>(
        'getCoinAddress',
        { coin, accountIndex },
      );
      return { ...address, coin };
    }

    case 'getXpub': {
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      const xpub = await connectionManager.sendCommand<{ xpub: string; path: string }>(
        'getCoinXpub',
        { coin, path: derivationPath },
      );
      return { ...xpub, coin };
    }

    case 'signTx': {
      const txHex = this.getNodeParameter('txHex', itemIndex) as string;
      const signed = await connectionManager.sendCommand<{ signedTx: string; txId: string }>(
        'signCoinTransaction',
        { coin, txHex },
      );
      return { ...signed, coin };
    }

    case 'signMessage': {
      const message = this.getNodeParameter('message', itemIndex) as string;
      const derivationPath = this.getNodeParameter('derivationPath', itemIndex) as string;
      const signature = await connectionManager.sendCommand<{ signature: string; address: string }>(
        'signCoinMessage',
        { coin, message, path: derivationPath },
      );
      return { ...signature, coin };
    }

    case 'getBalance': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const balance = await connectionManager.sendCommand<{
        balance: string;
        pending: string;
      }>('getCoinBalance', { coin, address });
      return { ...balance, coin, symbol: coinConfig.symbol };
    }

    case 'broadcast': {
      const txHex = this.getNodeParameter('txHex', itemIndex) as string;
      const result = await connectionManager.sendCommand<{ txId: string; success: boolean }>(
        'broadcastCoinTransaction',
        { coin, txHex },
      );
      return { ...result, coin };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
