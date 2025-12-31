/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';

import { DCentConnectionManager } from './transport/connectionManager';

export class DCentTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "D'CENT Trigger",
    name: 'dcentTrigger',
    icon: 'file:dcent.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: "Triggers workflow on D'CENT device events",
    defaults: {
      name: "D'CENT Trigger",
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'dcentDevice',
        required: true,
      },
      {
        name: 'dcentBridge',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Event Category',
        name: 'eventCategory',
        type: 'options',
        options: [
          { name: 'Device Events', value: 'device' },
          { name: 'Biometric Events', value: 'biometric' },
          { name: 'Bluetooth Events', value: 'bluetooth' },
          { name: 'NFC Events', value: 'nfc' },
          { name: 'Transaction Events', value: 'transaction' },
          { name: 'Signing Events', value: 'signing' },
          { name: 'Account Events', value: 'account' },
          { name: 'Security Events', value: 'security' },
        ],
        default: 'device',
        description: 'Category of events to listen for',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['device'],
          },
        },
        options: [
          { name: 'Device Connected', value: 'device_connected' },
          { name: 'Device Disconnected', value: 'device_disconnected' },
          { name: 'Device Ready', value: 'device_ready' },
          { name: 'Battery Low', value: 'battery_low' },
          { name: 'Battery Critical', value: 'battery_critical' },
          { name: 'Device Locked', value: 'device_locked' },
          { name: 'Device Unlocked', value: 'device_unlocked' },
        ],
        default: 'device_connected',
        description: 'Device event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['biometric'],
          },
        },
        options: [
          { name: 'Biometric Authenticated', value: 'biometric_authenticated' },
          { name: 'Biometric Failed', value: 'biometric_failed' },
          { name: 'Biometric Timeout', value: 'biometric_timeout' },
          { name: 'Fingerprint Enrolled', value: 'fingerprint_enrolled' },
          { name: 'Fingerprint Removed', value: 'fingerprint_removed' },
        ],
        default: 'biometric_authenticated',
        description: 'Biometric event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['bluetooth'],
          },
        },
        options: [
          { name: 'Bluetooth Connected', value: 'bluetooth_connected' },
          { name: 'Bluetooth Disconnected', value: 'bluetooth_disconnected' },
          { name: 'Bluetooth Device Found', value: 'bluetooth_device_found' },
          { name: 'Bluetooth Paired', value: 'bluetooth_paired' },
          { name: 'Bluetooth Signal Lost', value: 'bluetooth_signal_lost' },
        ],
        default: 'bluetooth_connected',
        description: 'Bluetooth event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['nfc'],
          },
        },
        options: [
          { name: 'Card Tapped', value: 'nfc_card_tapped' },
          { name: 'Card Removed', value: 'nfc_card_removed' },
          { name: 'Card Read Complete', value: 'nfc_read_complete' },
          { name: 'Card Error', value: 'nfc_error' },
        ],
        default: 'nfc_card_tapped',
        description: 'NFC event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['transaction'],
          },
        },
        options: [
          { name: 'Transaction Signed', value: 'transaction_signed' },
          { name: 'Transaction Rejected', value: 'transaction_rejected' },
          { name: 'Transaction Broadcast', value: 'transaction_broadcast' },
          { name: 'Transaction Confirmed', value: 'transaction_confirmed' },
          { name: 'Transaction Failed', value: 'transaction_failed' },
        ],
        default: 'transaction_signed',
        description: 'Transaction event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['signing'],
          },
        },
        options: [
          { name: 'Sign Request', value: 'sign_request' },
          { name: 'Signature Complete', value: 'signature_complete' },
          { name: 'Signing Cancelled', value: 'signing_cancelled' },
          { name: 'Signing Timeout', value: 'signing_timeout' },
        ],
        default: 'sign_request',
        description: 'Signing event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['account'],
          },
        },
        options: [
          { name: 'Account Created', value: 'account_created' },
          { name: 'Account Removed', value: 'account_removed' },
          { name: 'Balance Changed', value: 'balance_changed' },
          { name: 'Transaction Received', value: 'transaction_received' },
        ],
        default: 'account_created',
        description: 'Account event to trigger on',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        displayOptions: {
          show: {
            eventCategory: ['security'],
          },
        },
        options: [
          { name: 'PIN Changed', value: 'pin_changed' },
          { name: 'PIN Failed', value: 'pin_failed' },
          { name: 'Device Wiped', value: 'device_wiped' },
          { name: 'Tamper Alert', value: 'tamper_alert' },
          { name: 'Factory Reset', value: 'factory_reset' },
        ],
        default: 'pin_changed',
        description: 'Security event to trigger on',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Poll Interval (ms)',
            name: 'pollInterval',
            type: 'number',
            default: 1000,
            description: 'How often to poll for events (in milliseconds)',
          },
          {
            displayName: 'Include Device Info',
            name: 'includeDeviceInfo',
            type: 'boolean',
            default: true,
            description: 'Whether to include device information in the event payload',
          },
          {
            displayName: 'Filter by Coin',
            name: 'filterCoin',
            type: 'string',
            default: '',
            description: 'Only trigger for events related to this coin (e.g., BTC, ETH)',
          },
          {
            displayName: 'Minimum Amount',
            name: 'minAmount',
            type: 'string',
            default: '',
            description: 'Only trigger for transactions above this amount',
          },
        ],
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const event = this.getNodeParameter('event') as string;
    const eventCategory = this.getNodeParameter('eventCategory') as string;
    const options = this.getNodeParameter('options', {}) as {
      pollInterval?: number;
      includeDeviceInfo?: boolean;
      filterCoin?: string;
      minAmount?: string;
    };

    const pollInterval = options.pollInterval ?? 1000;
    const includeDeviceInfo = options.includeDeviceInfo ?? true;
    const filterCoin = options.filterCoin ?? '';
    const minAmount = options.minAmount ?? '';

    let connectionManager: DCentConnectionManager | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      try {
        // Get credentials
        const credentials = await this.getCredentials('dcentDevice');
        const connectionType = credentials.connectionType as 'usb' | 'bluetooth' | 'nfc' | 'bridge';

        // Initialize connection manager
        connectionManager = DCentConnectionManager.getInstance();

        // Connect to device based on connection type
        await connectionManager.connect({
          connectionType,
          devicePath: credentials.devicePath as string,
          bluetoothId: credentials.bluetoothId as string,
          bridgeUrl: credentials.bridgeUrl as string,
          timeout: credentials.timeout as number,
        });

        // Set up event listener
        connectionManager.on((connectionEvent) => {
          // Check if this is the event we're listening for
          if (connectionEvent.type !== 'status_change') {
            return;
          }

          const eventData: Record<string, unknown> = {
            eventType: connectionEvent.type,
            device: connectionEvent.device,
            previousStatus: connectionEvent.previousStatus,
            newStatus: connectionEvent.newStatus,
          };

          // Apply filters
          if (filterCoin && eventData.coin !== filterCoin) {
            return;
          }

          if (minAmount && eventData.amount) {
            const amount = parseFloat(eventData.amount as string);
            const minAmountValue = parseFloat(minAmount);
            if (amount < minAmountValue) {
              return;
            }
          }

          // Build payload
          const payload: Record<string, unknown> = {
            event,
            eventCategory,
            timestamp: new Date().toISOString(),
            data: eventData,
          };

          // Include device info if requested
          if (includeDeviceInfo && connectionManager) {
            try {
              payload.device = connectionManager.getDevice();
            } catch {
              // Ignore device info errors
            }
          }

          // Emit the event
          this.emit([this.helpers.returnJsonArray([payload as Record<string, string | number | boolean | object>])]);
        });

        // Start polling for events (for transports that don't support push)
        intervalId = setInterval(async () => {
          if (connectionManager) {
            try {
              await connectionManager.sendCommand('pollEvents');
            } catch {
              // Ignore polling errors
            }
          }
        }, pollInterval as number);
      } catch (error) {
        throw error;
      }
    };

    const stopPolling = async () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (connectionManager) {
        await connectionManager.disconnect();
        connectionManager = null;
      }
    };

    // Start polling
    await startPolling();

    // Return close function
    return {
      closeFunction: stopPolling,
    };
  }
}
