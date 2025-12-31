/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Connection Utilities
 * Handles device connection management across different transports
 */

import { CONNECTION_TYPES, DEVICE_STATUS, USB_HID, BLE, BRIDGE } from '../constants';
import type { ConnectionType, DeviceStatus } from '../constants';

export interface ConnectionConfig {
  type: ConnectionType;
  devicePath?: string;
  bluetoothId?: string;
  bridgeUrl?: string;
  timeout?: number;
}

export interface ConnectionState {
  connected: boolean;
  status: DeviceStatus;
  connectionType?: ConnectionType;
  deviceId?: string;
  lastActivity?: Date;
  error?: string;
}

export interface DeviceDescriptor {
  vendorId: number;
  productId: number;
  path: string;
  serialNumber?: string;
  manufacturer?: string;
  product?: string;
  release?: number;
  interface?: number;
  usagePage?: number;
  usage?: number;
}

/**
 * Find connected D'CENT USB devices
 */
export function findUsbDevices(): DeviceDescriptor[] {
  try {
    // Note: node-hid would be used in actual implementation
    // This is a placeholder that returns empty array if node-hid is not available
    const HID = require('node-hid');
    const devices = HID.devices() as DeviceDescriptor[];

    return devices.filter(
      (device: DeviceDescriptor) =>
        device.vendorId === USB_HID.DCENT_VENDOR_ID &&
        (device.productId === USB_HID.DCENT_PRODUCT_ID_V1 ||
          device.productId === USB_HID.DCENT_PRODUCT_ID_V2 ||
          device.productId === USB_HID.DCENT_PRODUCT_ID_V3),
    );
  } catch {
    return [];
  }
}

/**
 * Check if a D'CENT device is connected via USB
 */
export function isUsbDeviceConnected(): boolean {
  const devices = findUsbDevices();
  return devices.length > 0;
}

/**
 * Validate Bluetooth device name matches D'CENT pattern
 */
export function isValidBluetoothDevice(deviceName: string): boolean {
  return BLE.DEVICE_NAME_PATTERN.test(deviceName);
}

/**
 * Check if Bridge is available at the specified URL
 */
export async function isBridgeAvailable(url: string = BRIDGE.DEFAULT_URL): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${url}/info`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get default connection configuration based on connection type
 */
export function getDefaultConnectionConfig(type: ConnectionType): ConnectionConfig {
  switch (type) {
    case CONNECTION_TYPES.USB:
      return {
        type: CONNECTION_TYPES.USB,
        timeout: USB_HID.TIMEOUT_MS,
      };
    case CONNECTION_TYPES.BLUETOOTH:
      return {
        type: CONNECTION_TYPES.BLUETOOTH,
        timeout: BLE.CONNECTION_TIMEOUT_MS,
      };
    case CONNECTION_TYPES.NFC:
      return {
        type: CONNECTION_TYPES.NFC,
        timeout: 30000,
      };
    case CONNECTION_TYPES.BRIDGE:
      return {
        type: CONNECTION_TYPES.BRIDGE,
        bridgeUrl: BRIDGE.DEFAULT_URL,
        timeout: BRIDGE.REQUEST_TIMEOUT_MS,
      };
    default:
      throw new Error(`Unknown connection type: ${type}`);
  }
}

/**
 * Create initial connection state
 */
export function createConnectionState(): ConnectionState {
  return {
    connected: false,
    status: DEVICE_STATUS.DISCONNECTED,
  };
}

/**
 * Update connection state
 */
export function updateConnectionState(
  state: ConnectionState,
  updates: Partial<ConnectionState>,
): ConnectionState {
  return {
    ...state,
    ...updates,
    lastActivity: new Date(),
  };
}

/**
 * Validate connection configuration
 */
export function validateConnectionConfig(config: ConnectionConfig): string[] {
  const errors: string[] = [];

  if (!config.type) {
    errors.push('Connection type is required');
  }

  if (config.type === CONNECTION_TYPES.BLUETOOTH && !config.bluetoothId) {
    errors.push('Bluetooth device ID is required for Bluetooth connections');
  }

  if (config.type === CONNECTION_TYPES.BRIDGE) {
    if (!config.bridgeUrl) {
      config.bridgeUrl = BRIDGE.DEFAULT_URL;
    }
    try {
      new URL(config.bridgeUrl);
    } catch {
      errors.push('Invalid bridge URL');
    }
  }

  return errors;
}

/**
 * Format device path for display
 */
export function formatDevicePath(path: string): string {
  if (!path) return 'Unknown';

  // Shorten long USB paths for display
  if (path.includes('usb')) {
    const parts = path.split('#');
    if (parts.length > 1) {
      return `USB: ${parts[0].split('/').pop() || path}`;
    }
  }

  return path;
}

/**
 * Generate a unique connection ID
 */
export function generateConnectionId(): string {
  return `dcent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if the error is a timeout error
 */
export function isTimeoutError(error: Error): boolean {
  return (
    error.message.toLowerCase().includes('timeout') ||
    error.name === 'TimeoutError' ||
    error.message.toLowerCase().includes('timed out')
  );
}

/**
 * Check if the error is a connection error
 */
export function isConnectionError(error: Error): boolean {
  const connectionErrors = ['econnrefused', 'enotfound', 'etimedout', 'connection refused', 'not found'];
  const message = error.message.toLowerCase();
  return connectionErrors.some((e) => message.includes(e));
}

/**
 * Retry a connection operation with exponential backoff
 */
export async function retryConnection<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Connection failed after max attempts');
}
