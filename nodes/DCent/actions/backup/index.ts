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
        hasBackup: boolean;
        backupDate: string | null;
        seedPhraseLength: number;
        lastVerified: string | null;
      }>('getBackupStatus');
      return status;
    }

    case 'verifyRecoveryPhrase': {
      const wordIndices = this.getNodeParameter('wordIndices', itemIndex) as number[];
      const words = this.getNodeParameter('words', itemIndex) as string[];
      
      const result = await connectionManager.sendCommand<{
        valid: boolean;
        verified: boolean;
      }>('verifyRecoveryPhrase', { wordIndices, words });
      return result;
    }

    case 'initiateRecovery': {
      const seedPhraseLength = this.getNodeParameter('seedPhraseLength', itemIndex, 24) as number;
      
      const result = await connectionManager.sendCommand<{
        sessionId: string;
        instructions: string;
        expectedWords: number;
      }>('initiateRecovery', { seedPhraseLength });
      return result;
    }

    case 'checkIntegrity': {
      const result = await connectionManager.sendCommand<{
        integrityValid: boolean;
        accounts: Array<{
          coin: string;
          address: string;
          valid: boolean;
        }>;
      }>('checkBackupIntegrity');
      return result;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
