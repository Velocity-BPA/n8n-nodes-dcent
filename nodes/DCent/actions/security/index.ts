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
    case 'getStatus': {
      const status = await connectionManager.sendCommand<{
        pinEnabled: boolean;
        biometricEnabled: boolean;
        autoLockEnabled: boolean;
        autoLockTimeout: number;
        securityLevel: string;
        certifications: string[];
      }>('getSecurityStatus');
      return status;
    }

    case 'setAutoLock': {
      const enabled = this.getNodeParameter('enabled', itemIndex, true) as boolean;
      const timeout = this.getNodeParameter('timeout', itemIndex, 60) as number;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
      }>('setAutoLock', { enabled, timeout });
      return result;
    }

    case 'lock': {
      const result = await connectionManager.sendCommand<{
        success: boolean;
        locked: boolean;
      }>('lockDevice');
      return result;
    }

    case 'unlock': {
      const method = this.getNodeParameter('method', itemIndex, 'pin') as string;
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
        unlocked: boolean;
      }>('unlockDevice', { method });
      return result;
    }

    case 'verifyAuthenticity': {
      const result = await connectionManager.sendCommand<{
        authentic: boolean;
        deviceId: string;
        certificate: string;
        signature: string;
      }>('verifyDeviceAuthenticity');
      return result;
    }

    case 'getAuditLog': {
      const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
      
      const log = await connectionManager.sendCommand<{
        events: Array<{
          timestamp: number;
          type: string;
          details: string;
        }>;
      }>('getSecurityAuditLog', { limit });
      return log;
    }

    case 'wipeDevice': {
      const confirmation = this.getNodeParameter('confirmation', itemIndex) as string;
      
      if (confirmation !== 'WIPE') {
        throw new Error('Invalid confirmation. Type "WIPE" to confirm device wipe.');
      }
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
        wiped: boolean;
      }>('wipeDevice');
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
