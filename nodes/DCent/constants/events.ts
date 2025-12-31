/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Event Types for Trigger Node
 */

export const EVENT_CATEGORIES = {
  DEVICE: 'device',
  BIOMETRIC: 'biometric',
  TRANSACTION: 'transaction',
  SIGNING: 'signing',
  ACCOUNT: 'account',
  SECURITY: 'security',
  BLUETOOTH: 'bluetooth',
  NFC: 'nfc',
} as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];

export const DEVICE_EVENTS = {
  CONNECTED: 'device.connected',
  DISCONNECTED: 'device.disconnected',
  LOCKED: 'device.locked',
  UNLOCKED: 'device.unlocked',
  BATTERY_LOW: 'device.battery_low',
  FIRMWARE_UPDATE: 'device.firmware_update',
  ERROR: 'device.error',
} as const;

export const BIOMETRIC_EVENTS = {
  AUTHENTICATED: 'biometric.authenticated',
  FAILED: 'biometric.failed',
  ENROLLED: 'biometric.enrolled',
  REMOVED: 'biometric.removed',
  TIMEOUT: 'biometric.timeout',
} as const;

export const BLUETOOTH_EVENTS = {
  CONNECTED: 'bluetooth.connected',
  DISCONNECTED: 'bluetooth.disconnected',
  PAIRED: 'bluetooth.paired',
  UNPAIRED: 'bluetooth.unpaired',
  DISCOVERY_STARTED: 'bluetooth.discovery_started',
  DISCOVERY_STOPPED: 'bluetooth.discovery_stopped',
  DEVICE_FOUND: 'bluetooth.device_found',
  SIGNAL_STRENGTH: 'bluetooth.signal_strength',
} as const;

export const NFC_EVENTS = {
  CARD_TAPPED: 'nfc.card_tapped',
  CARD_REMOVED: 'nfc.card_removed',
  COMMUNICATION_ERROR: 'nfc.communication_error',
  READ_SUCCESS: 'nfc.read_success',
} as const;

export const TRANSACTION_EVENTS = {
  SIGNED: 'transaction.signed',
  REJECTED: 'transaction.rejected',
  BROADCAST: 'transaction.broadcast',
  CONFIRMED: 'transaction.confirmed',
  FAILED: 'transaction.failed',
  PENDING: 'transaction.pending',
} as const;

export const SIGNING_EVENTS = {
  REQUEST: 'signing.request',
  COMPLETE: 'signing.complete',
  CANCELLED: 'signing.cancelled',
  TIMEOUT: 'signing.timeout',
  ERROR: 'signing.error',
} as const;

export const ACCOUNT_EVENTS = {
  CREATED: 'account.created',
  DELETED: 'account.deleted',
  BALANCE_CHANGED: 'account.balance_changed',
  TRANSACTION_RECEIVED: 'account.transaction_received',
  SYNCED: 'account.synced',
} as const;

export const SECURITY_EVENTS = {
  PIN_CHANGED: 'security.pin_changed',
  PIN_FAILED: 'security.pin_failed',
  DEVICE_LOCKED: 'security.device_locked',
  TAMPER_ALERT: 'security.tamper_alert',
  DEVICE_WIPED: 'security.device_wiped',
  FACTORY_RESET: 'security.factory_reset',
} as const;

export const ALL_EVENTS = {
  ...DEVICE_EVENTS,
  ...BIOMETRIC_EVENTS,
  ...BLUETOOTH_EVENTS,
  ...NFC_EVENTS,
  ...TRANSACTION_EVENTS,
  ...SIGNING_EVENTS,
  ...ACCOUNT_EVENTS,
  ...SECURITY_EVENTS,
} as const;

export type DCentEvent = (typeof ALL_EVENTS)[keyof typeof ALL_EVENTS];

export interface EventPayload {
  event: DCentEvent;
  timestamp: string;
  deviceId?: string;
  deviceModel?: string;
  data?: Record<string, unknown>;
}

export interface DeviceConnectedPayload extends EventPayload {
  data: {
    connectionType: string;
    firmwareVersion: string;
    serialNumber: string;
  };
}

export interface TransactionSignedPayload extends EventPayload {
  data: {
    txHash: string;
    coinType: string;
    from: string;
    to: string;
    amount: string;
    signature: string;
  };
}

export interface BalanceChangedPayload extends EventPayload {
  data: {
    coinType: string;
    address: string;
    previousBalance: string;
    newBalance: string;
    difference: string;
  };
}

export const EVENT_DESCRIPTIONS: Record<string, string> = {
  'device.connected': 'Device has been connected',
  'device.disconnected': 'Device has been disconnected',
  'device.locked': 'Device has been locked',
  'device.unlocked': 'Device has been unlocked',
  'device.battery_low': 'Device battery is low',
  'device.firmware_update': 'Firmware update available',
  'device.error': 'Device error occurred',
  'biometric.authenticated': 'Biometric authentication successful',
  'biometric.failed': 'Biometric authentication failed',
  'biometric.enrolled': 'New fingerprint enrolled',
  'biometric.removed': 'Fingerprint removed',
  'biometric.timeout': 'Biometric authentication timed out',
  'bluetooth.connected': 'Bluetooth connected',
  'bluetooth.disconnected': 'Bluetooth disconnected',
  'bluetooth.paired': 'Bluetooth device paired',
  'bluetooth.unpaired': 'Bluetooth device unpaired',
  'bluetooth.discovery_started': 'Bluetooth discovery started',
  'bluetooth.discovery_stopped': 'Bluetooth discovery stopped',
  'bluetooth.device_found': 'Bluetooth device found',
  'bluetooth.signal_strength': 'Bluetooth signal strength changed',
  'nfc.card_tapped': 'NFC card tapped',
  'nfc.card_removed': 'NFC card removed',
  'nfc.communication_error': 'NFC communication error',
  'nfc.read_success': 'NFC read successful',
  'transaction.signed': 'Transaction signed',
  'transaction.rejected': 'Transaction rejected by user',
  'transaction.broadcast': 'Transaction broadcast to network',
  'transaction.confirmed': 'Transaction confirmed on chain',
  'transaction.failed': 'Transaction failed',
  'transaction.pending': 'Transaction pending',
  'signing.request': 'Signing request initiated',
  'signing.complete': 'Signing completed',
  'signing.cancelled': 'Signing cancelled',
  'signing.timeout': 'Signing timed out',
  'signing.error': 'Signing error occurred',
  'account.created': 'New account created',
  'account.deleted': 'Account deleted',
  'account.balance_changed': 'Account balance changed',
  'account.transaction_received': 'Transaction received',
  'account.synced': 'Account synced',
  'security.pin_changed': 'PIN changed',
  'security.pin_failed': 'PIN entry failed',
  'security.device_locked': 'Device locked due to failed attempts',
  'security.tamper_alert': 'Tamper detection triggered',
  'security.device_wiped': 'Device wiped',
  'security.factory_reset': 'Factory reset performed',
};
