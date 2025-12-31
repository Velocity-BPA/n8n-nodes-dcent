/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { DCentConnectionManager } from '../../transport/connectionManager';
import type { BiometricState } from '../../utils/biometricUtils';

export async function execute(
  this: IExecuteFunctions,
  operation: string,
  _itemIndex: number,
): Promise<Record<string, unknown>> {
  const connectionManager = DCentConnectionManager.getInstance();

  switch (operation) {
    case 'getStatus': {
      const status = await connectionManager.sendCommand<BiometricState>('getBiometricStatus');
      return status as unknown as Record<string, unknown>;
    }

    case 'isEnabled': {
      const status = await connectionManager.sendCommand<{ enabled: boolean }>('getBiometricStatus');
      return { enabled: status.enabled };
    }

    case 'getEnrolled': {
      const enrolled = await connectionManager.sendCommand<{
        count: number;
        fingerprints: Array<{ id: number; name: string }>;
      }>('getEnrolledFingerprints');
      return enrolled;
    }

    case 'authenticate': {
      // Biometric authentication workflow:
      // 1. Send authenticate request to device
      // 2. Device displays fingerprint prompt
      // 3. User places finger on sensor
      // 4. Device returns success/failure
      const result = await connectionManager.sendCommand<{
        success: boolean;
        fingerprintId?: number;
        timestamp: string;
      }>('authenticateBiometric');

      return {
        authenticated: result.success,
        fingerprintId: result.fingerprintId,
        timestamp: result.timestamp,
      };
    }

    case 'enable': {
      await connectionManager.sendCommand('enableBiometric');
      return { success: true, enabled: true };
    }

    case 'disable': {
      await connectionManager.sendCommand('disableBiometric');
      return { success: true, enabled: false };
    }

    case 'getSettings': {
      const settings = await connectionManager.sendCommand<{
        enabled: boolean;
        maxEnrollments: number;
        timeoutSeconds: number;
        requireForSigning: boolean;
        requireForUnlock: boolean;
      }>('getBiometricSettings');
      return settings;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
