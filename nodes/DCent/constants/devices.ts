/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Device Models and Connection Types
 */

export const DEVICE_MODELS = {
  BIOMETRIC: 'biometric',
  CARD: 'card',
  LITE: 'lite',
} as const;

export type DeviceModel = (typeof DEVICE_MODELS)[keyof typeof DEVICE_MODELS];

export const CONNECTION_TYPES = {
  USB: 'usb',
  BLUETOOTH: 'bluetooth',
  NFC: 'nfc',
  BRIDGE: 'bridge',
} as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[keyof typeof CONNECTION_TYPES];

export interface DeviceInfo {
  model: DeviceModel;
  name: string;
  description: string;
  supportedConnections: ConnectionType[];
  hasBiometric: boolean;
  hasNfc: boolean;
  hasDisplay: boolean;
  secureElement: string;
  maxAccounts: number;
}

export const DEVICE_MODELS_INFO: Record<DeviceModel, DeviceInfo> = {
  [DEVICE_MODELS.BIOMETRIC]: {
    model: DEVICE_MODELS.BIOMETRIC,
    name: "D'CENT Biometric Wallet",
    description: 'Hardware wallet with fingerprint authentication, OLED display, USB and Bluetooth connectivity',
    supportedConnections: [CONNECTION_TYPES.USB, CONNECTION_TYPES.BLUETOOTH],
    hasBiometric: true,
    hasNfc: false,
    hasDisplay: true,
    secureElement: 'EAL5+',
    maxAccounts: 200,
  },
  [DEVICE_MODELS.CARD]: {
    model: DEVICE_MODELS.CARD,
    name: "D'CENT Card Wallet",
    description: 'Credit card-sized NFC wallet for mobile integration',
    supportedConnections: [CONNECTION_TYPES.NFC],
    hasBiometric: false,
    hasNfc: true,
    hasDisplay: false,
    secureElement: 'EAL6+',
    maxAccounts: 50,
  },
  [DEVICE_MODELS.LITE]: {
    model: DEVICE_MODELS.LITE,
    name: "D'CENT Lite",
    description: 'Software wallet integrated with the D\'CENT mobile app',
    supportedConnections: [CONNECTION_TYPES.BRIDGE],
    hasBiometric: false,
    hasNfc: false,
    hasDisplay: false,
    secureElement: 'Software',
    maxAccounts: 100,
  },
};

export const USB_IDENTIFIERS = {
  VENDOR_ID: 0x2c97, // D'CENT vendor ID
  PRODUCT_IDS: {
    BIOMETRIC: 0x0001,
    BIOMETRIC_V2: 0x0002,
  },
  USAGE_PAGE: 0xffa0,
  INTERFACE: 0,
} as const;

export const BLUETOOTH_UUIDS = {
  SERVICE_UUID: '0000fff0-0000-1000-8000-00805f9b34fb',
  TX_CHARACTERISTIC: '0000fff1-0000-1000-8000-00805f9b34fb',
  RX_CHARACTERISTIC: '0000fff2-0000-1000-8000-00805f9b34fb',
  DEVICE_NAME_PREFIX: 'DCENT',
} as const;

export const NFC_PARAMETERS = {
  AID: 'D276000085010001',
  MIN_VERSION: '1.0.0',
  TIMEOUT_MS: 30000,
} as const;

export const BRIDGE_DEFAULTS = {
  URL: 'http://127.0.0.1:9527',
  VERSION: '2.0.0',
  TIMEOUT_MS: 60000,
  HEARTBEAT_INTERVAL_MS: 5000,
} as const;

export const DEVICE_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  BUSY: 'busy',
  ERROR: 'error',
  INITIALIZING: 'initializing',
  READY: 'ready',
} as const;

export type DeviceStatus = (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS];

export const BIOMETRIC_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
  FAILED: 'failed',
  NOT_ENROLLED: 'not_enrolled',
} as const;

export type BiometricStatus = (typeof BIOMETRIC_STATUS)[keyof typeof BIOMETRIC_STATUS];

export const FIRMWARE_INFO = {
  MIN_VERSION: '2.0.0',
  LATEST_VERSION: '2.27.0',
  UPDATE_URL: 'https://dcentwallet.com/firmware',
} as const;

export function getDeviceInfo(model: DeviceModel): DeviceInfo | undefined {
  return DEVICE_MODELS_INFO[model];
}

export function supportsConnection(model: DeviceModel, connection: ConnectionType): boolean {
  const info = getDeviceInfo(model);
  return info?.supportedConnections.includes(connection) ?? false;
}

export function hasBiometric(model: DeviceModel): boolean {
  return getDeviceInfo(model)?.hasBiometric ?? false;
}
