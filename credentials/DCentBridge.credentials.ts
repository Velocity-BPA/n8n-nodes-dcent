/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DCentBridge implements ICredentialType {
  name = 'dcentBridge';
  displayName = "D'CENT Bridge";
  documentationUrl = 'https://dcentwallet.com/support/bridge';
  properties: INodeProperties[] = [
    {
      displayName: 'Bridge URL',
      name: 'bridgeUrl',
      type: 'string',
      default: 'http://127.0.0.1:9527',
      required: true,
      description: "D'CENT Bridge server URL",
    },
    {
      displayName: 'WebSocket URL',
      name: 'wsUrl',
      type: 'string',
      default: 'ws://127.0.0.1:9527/ws',
      description: 'WebSocket endpoint for real-time events',
    },
    {
      displayName: 'Bridge Version',
      name: 'bridgeVersion',
      type: 'string',
      default: '',
      placeholder: '1.0.0',
      description: 'Expected bridge version (leave empty for any)',
    },
    {
      displayName: 'Session ID',
      name: 'sessionId',
      type: 'string',
      default: '',
      description: 'Optional session identifier for persistent connections',
    },
    {
      displayName: 'Connection Timeout (ms)',
      name: 'timeout',
      type: 'number',
      default: 10000,
      description: 'Connection timeout in milliseconds',
    },
    {
      displayName: 'Heartbeat Interval (ms)',
      name: 'heartbeatInterval',
      type: 'number',
      default: 5000,
      description: 'Interval for keepalive heartbeats',
    },
    {
      displayName: 'Auto Reconnect',
      name: 'autoReconnect',
      type: 'boolean',
      default: true,
      description: 'Automatically reconnect if connection is lost',
    },
  ];
}
