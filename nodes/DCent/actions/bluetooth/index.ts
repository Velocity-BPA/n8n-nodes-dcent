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
      const devices = await connectionManager.sendCommand<{
        devices: Array<{
          id: string;
          name: string;
          rssi: number;
        }>;
      }>('scanBluetoothDevices');
      return devices;
    }

    case 'connect': {
      const credentials = await this.getCredentials('dcentDevice');
      const bluetoothId = credentials.bluetoothId as string;
      await connectionManager.connect({ connectionType: 'bluetooth', bluetoothId });
      return { success: true, connected: true };
    }

    case 'disconnect': {
      await connectionManager.disconnect();
      return { success: true, connected: false };
    }

    case 'getStatus': {
      const status = await connectionManager.sendCommand<{
        connected: boolean;
        deviceName: string;
        rssi: number;
      }>('getBluetoothStatus');
      return status;
    }

    case 'pair': {
      const credentials = await this.getCredentials('dcentDevice');
      const bluetoothId = credentials.bluetoothId as string;
      const result = await connectionManager.sendCommand<{ success: boolean; deviceId: string }>(
        'pairBluetoothDevice',
        { deviceId: bluetoothId },
      );
      return result;
    }

    case 'unpair': {
      const credentials = await this.getCredentials('dcentDevice');
      const bluetoothId = credentials.bluetoothId as string;
      await connectionManager.sendCommand('unpairBluetoothDevice', { deviceId: bluetoothId });
      return { success: true };
    }

    case 'getSignalStrength': {
      const rssi = await connectionManager.sendCommand<{ rssi: number; quality: string }>(
        'getBluetoothSignalStrength',
      );
      return rssi;
    }

    case 'getPairedDevices': {
      const devices = await connectionManager.sendCommand<{
        devices: Array<{ id: string; name: string; paired: boolean }>;
      }>('getPairedBluetoothDevices');
      return devices;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
