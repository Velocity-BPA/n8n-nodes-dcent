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
    case 'ping': {
      const result = await connectionManager.sendCommand<{
        pong: boolean;
        latency: number;
        timestamp: number;
      }>('ping');
      return result;
    }

    case 'getTime': {
      const time = await connectionManager.sendCommand<{
        deviceTime: number;
        systemTime: number;
        offset: number;
      }>('getDeviceTime');
      return time;
    }

    case 'setTime': {
      const result = await connectionManager.sendCommand<{
        success: boolean;
        newTime: number;
      }>('setDeviceTime', { time: Date.now() });
      return result;
    }

    case 'getLabel': {
      const label = await connectionManager.sendCommand<{
        label: string;
      }>('getDeviceLabel');
      return label;
    }

    case 'setLabel': {
      const label = this.getNodeParameter('label', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
        label: string;
      }>('setDeviceLabel', { label });
      return result;
    }

    case 'generateRandom': {
      const length = this.getNodeParameter('length', itemIndex, 32) as number;
      
      const random = await connectionManager.sendCommand<{
        random: string;
        length: number;
        entropy: string;
      }>('generateRandom', { length });
      return random;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
