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
    case 'verify': {
      const pin = this.getNodeParameter('pin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        verified: boolean;
        attemptsRemaining: number;
      }>('verifyPin', { pin });
      return result;
    }

    case 'change': {
      const currentPin = this.getNodeParameter('currentPin', itemIndex) as string;
      const newPin = this.getNodeParameter('newPin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
      }>('changePin', { currentPin, newPin });
      return result;
    }

    case 'getStatus': {
      const status = await connectionManager.sendCommand<{
        pinSet: boolean;
        attemptsRemaining: number;
        locked: boolean;
      }>('getPinStatus');
      return status;
    }

    case 'reset': {
      const recoveryPhrase = this.getNodeParameter('recoveryPhrase', itemIndex) as string;
      const newPin = this.getNodeParameter('newPin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
      }>('resetPin', { recoveryPhrase, newPin });
      return result;
    }

    case 'enable': {
      const pin = this.getNodeParameter('pin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
      }>('enablePin', { pin });
      return result;
    }

    case 'disable': {
      const pin = this.getNodeParameter('pin', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
      }>('disablePin', { pin });
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
