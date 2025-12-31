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
  _itemIndex: number,
): Promise<Record<string, unknown>> {
  const connectionManager = DCentConnectionManager.getInstance();

  switch (operation) {
    case 'scan': {
      const result = await connectionManager.sendCommand<{
        found: boolean;
        cardInfo?: { id: string; type: string };
      }>('scanNfcCard');
      return result;
    }

    case 'connect': {
      await connectionManager.connect({ connectionType: 'nfc' });
      return { success: true, connected: true };
    }

    case 'disconnect': {
      await connectionManager.disconnect();
      return { success: true, connected: false };
    }

    case 'getCardInfo': {
      const info = await connectionManager.sendCommand<{
        cardId: string;
        type: string;
        manufacturer: string;
        firmwareVersion: string;
      }>('getNfcCardInfo');
      return info;
    }

    case 'readData': {
      const data = await connectionManager.sendCommand<{
        data: string;
        encoding: string;
      }>('readNfcData');
      return data;
    }

    case 'getStatus': {
      const status = await connectionManager.sendCommand<{
        enabled: boolean;
        cardPresent: boolean;
        cardId?: string;
      }>('getNfcStatus');
      return status;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
