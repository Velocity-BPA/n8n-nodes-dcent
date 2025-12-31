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
    case 'getVersion': {
      const version = await connectionManager.sendCommand<{
        firmwareVersion: string;
        bootloaderVersion: string;
        deviceModel: string;
        buildDate: string;
      }>('getFirmwareVersion');
      return version;
    }

    case 'checkUpdate': {
      const result = await connectionManager.sendCommand<{
        updateAvailable: boolean;
        currentVersion: string;
        latestVersion: string;
        releaseNotes: string;
        mandatory: boolean;
      }>('checkFirmwareUpdate');
      return result;
    }

    case 'download': {
      const version = this.getNodeParameter('version', itemIndex) as string;
      
      const result = await connectionManager.sendCommand<{
        downloaded: boolean;
        filePath: string;
        checksum: string;
        size: number;
      }>('downloadFirmware', { version });
      return result;
    }

    case 'install': {
      const confirmation = this.getNodeParameter('confirmation', itemIndex) as string;
      
      if (confirmation !== 'UPDATE') {
        throw new Error('Invalid confirmation. Type "UPDATE" to confirm firmware update.');
      }
      
      const result = await connectionManager.sendCommand<{
        success: boolean;
        newVersion: string;
        restartRequired: boolean;
      }>('installFirmware');
      return result;
    }

    case 'getChangelog': {
      const version = this.getNodeParameter('version', itemIndex, '') as string;
      
      const changelog = await connectionManager.sendCommand<{
        versions: Array<{
          version: string;
          releaseDate: string;
          changes: string[];
        }>;
      }>('getFirmwareChangelog', { version });
      return changelog;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
