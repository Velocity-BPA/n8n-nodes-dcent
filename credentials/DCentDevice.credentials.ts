/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DCentDevice implements ICredentialType {
  name = 'dcentDevice';
  displayName = "D'CENT Device";
  documentationUrl = 'https://dcentwallet.com/support';
  properties: INodeProperties[] = [
    {
      displayName: 'Device Model',
      name: 'deviceModel',
      type: 'options',
      options: [
        { name: "D'CENT Biometric Wallet", value: 'biometric' },
        { name: "D'CENT Card Wallet", value: 'card' },
        { name: "D'CENT Lite (Mobile)", value: 'lite' },
      ],
      default: 'biometric',
      description: "The D'CENT wallet model to connect to",
    },
    {
      displayName: 'Connection Type',
      name: 'connectionType',
      type: 'options',
      options: [
        { name: 'USB', value: 'usb' },
        { name: 'Bluetooth', value: 'bluetooth' },
        { name: 'NFC', value: 'nfc' },
        { name: "D'CENT Bridge", value: 'bridge' },
      ],
      default: 'usb',
      description: 'How to connect to the device',
    },
    {
      displayName: 'Device Path',
      name: 'devicePath',
      type: 'string',
      default: '',
      placeholder: '/dev/hidraw0',
      description: 'USB HID device path (leave empty for auto-detection)',
      displayOptions: {
        show: {
          connectionType: ['usb'],
        },
      },
    },
    {
      displayName: 'Bluetooth Device ID',
      name: 'bluetoothId',
      type: 'string',
      default: '',
      placeholder: 'DCENT-XXXXXXXX',
      description: 'Bluetooth device identifier',
      displayOptions: {
        show: {
          connectionType: ['bluetooth'],
        },
      },
    },
    {
      displayName: 'Bridge URL',
      name: 'bridgeUrl',
      type: 'string',
      default: 'http://127.0.0.1:9527',
      description: "D'CENT Bridge server URL",
      displayOptions: {
        show: {
          connectionType: ['bridge'],
        },
      },
    },
    {
      displayName: 'Connection Timeout (ms)',
      name: 'timeout',
      type: 'number',
      default: 30000,
      description: 'Connection timeout in milliseconds',
    },
    {
      displayName: 'Auto Reconnect',
      name: 'autoReconnect',
      type: 'boolean',
      default: true,
      description: 'Whether to automatically reconnect on connection loss',
    },
  ];
}
