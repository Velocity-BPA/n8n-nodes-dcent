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
  const credentials = await this.getCredentials('dcentDevice');
  const connectionManager = DCentConnectionManager.getInstance();

  switch (operation) {
    case 'connect': {
      const connectionType = credentials.connectionType as 'usb' | 'bluetooth' | 'nfc' | 'bridge';
      await connectionManager.connect({
        connectionType,
        devicePath: credentials.devicePath as string,
        bluetoothId: credentials.bluetoothId as string,
        bridgeUrl: credentials.bridgeUrl as string,
        timeout: credentials.timeout as number,
      });
      return { success: true, connected: true };
    }

    case 'disconnect': {
      await connectionManager.disconnect();
      return { success: true, connected: false };
    }

    case 'getInfo': {
      const info = await connectionManager.sendCommand<{
        model: string;
        firmwareVersion: string;
        serialNumber: string;
        label: string;
      }>('getDeviceInfo');
      return info;
    }

    case 'getModel': {
      const info = await connectionManager.sendCommand<{ model: string }>('getDeviceInfo');
      return { model: info.model };
    }

    case 'getFirmwareVersion': {
      const info = await connectionManager.sendCommand<{ firmwareVersion: string }>('getDeviceInfo');
      return { firmwareVersion: info.firmwareVersion };
    }

    case 'getSerialNumber': {
      const info = await connectionManager.sendCommand<{ serialNumber: string }>('getDeviceInfo');
      return { serialNumber: info.serialNumber };
    }

    case 'getStatus': {
      const status = await connectionManager.sendCommand<{
        status: string;
        isLocked: boolean;
        isInitialized: boolean;
      }>('getDeviceStatus');
      return status;
    }

    case 'getBatteryLevel': {
      const battery = await connectionManager.sendCommand<{ level: number; charging: boolean }>(
        'getBatteryLevel',
      );
      return battery;
    }

    case 'getBluetoothStatus': {
      const bluetooth = await connectionManager.sendCommand<{
        enabled: boolean;
        connected: boolean;
        deviceName: string;
      }>('getBluetoothStatus');
      return bluetooth;
    }

    case 'getBiometricStatus': {
      const biometric = await connectionManager.sendCommand<{
        enabled: boolean;
        enrolledCount: number;
      }>('getBiometricStatus');
      return biometric;
    }

    case 'verifyAuthenticity': {
      const result = await connectionManager.sendCommand<{
        authentic: boolean;
        certificate: string;
      }>('verifyAuthenticity');
      return result;
    }

    case 'checkConnection': {
      const isConnected = connectionManager.isConnected();
      return { connected: isConnected };
    }

    case 'getLabel': {
      const info = await connectionManager.sendCommand<{ label: string }>('getDeviceInfo');
      return { label: info.label };
    }

    case 'setLabel': {
      const label = this.getNodeParameter('deviceLabel', itemIndex) as string;
      await connectionManager.sendCommand('setDeviceLabel', { label });
      return { success: true, label };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
