/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Transport Identifiers and Protocol Constants
 */

// USB HID identifiers
export const USB_HID = {
  DCENT_VENDOR_ID: 0x2c97,
  DCENT_PRODUCT_ID_V1: 0x0001,
  DCENT_PRODUCT_ID_V2: 0x0002,
  DCENT_PRODUCT_ID_V3: 0x0003,
  USAGE_PAGE: 0xffa0,
  USAGE: 0x01,
  INTERFACE_NUMBER: 0,
  PACKET_SIZE: 64,
  TIMEOUT_MS: 30000,
} as const;

// Bluetooth Low Energy identifiers
export const BLE = {
  SERVICE_UUID: '0000fff0-0000-1000-8000-00805f9b34fb',
  TX_CHARACTERISTIC_UUID: '0000fff1-0000-1000-8000-00805f9b34fb',
  RX_CHARACTERISTIC_UUID: '0000fff2-0000-1000-8000-00805f9b34fb',
  NOTIFICATION_CHARACTERISTIC: '0000fff3-0000-1000-8000-00805f9b34fb',
  DEVICE_NAME_PREFIX: 'DCENT',
  DEVICE_NAME_PATTERN: /^DCENT-[A-Z0-9]+$/,
  MTU_SIZE: 247,
  CONNECTION_TIMEOUT_MS: 10000,
  SCAN_TIMEOUT_MS: 30000,
} as const;

// NFC parameters for Card Wallet
export const NFC = {
  AID: [0xD2, 0x76, 0x00, 0x00, 0x85, 0x01, 0x00, 0x01],
  AID_STRING: 'D276000085010001',
  PROTOCOL: 'ISO-DEP',
  TIMEOUT_MS: 30000,
  MAX_APDU_SIZE: 255,
  SELECT_COMMAND: 0xA4,
  READ_COMMAND: 0xB0,
  SIGN_COMMAND: 0xF2,
} as const;

// D'CENT Bridge API
export const BRIDGE = {
  DEFAULT_URL: 'http://127.0.0.1:9527',
  DEFAULT_HTTPS_URL: 'https://127.0.0.1:9528',
  API_VERSION: 'v1',
  WEBSOCKET_PATH: '/ws',
  HEARTBEAT_INTERVAL_MS: 5000,
  RECONNECT_INTERVAL_MS: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  REQUEST_TIMEOUT_MS: 60000,
} as const;

// Protocol commands
export const COMMANDS = {
  // Device commands
  GET_INFO: 0x01,
  GET_STATUS: 0x02,
  PING: 0x03,
  SET_LABEL: 0x04,

  // Account commands
  GET_ACCOUNT: 0x10,
  CREATE_ACCOUNT: 0x11,
  DELETE_ACCOUNT: 0x12,
  GET_ADDRESS: 0x13,
  GET_XPUB: 0x14,

  // Transaction commands
  SIGN_TX: 0x20,
  SIGN_MESSAGE: 0x21,
  SIGN_TYPED_DATA: 0x22,
  SIGN_PSBT: 0x23,

  // Security commands
  GET_PIN_STATUS: 0x30,
  SET_PIN: 0x31,
  CHANGE_PIN: 0x32,
  LOCK: 0x33,
  UNLOCK: 0x34,
  WIPE: 0x35,

  // Biometric commands
  GET_BIOMETRIC_STATUS: 0x40,
  AUTHENTICATE_BIOMETRIC: 0x41,
  ENROLL_FINGERPRINT: 0x42,
  DELETE_FINGERPRINT: 0x43,

  // Firmware commands
  GET_FIRMWARE_VERSION: 0x50,
  CHECK_UPDATE: 0x51,
  START_UPDATE: 0x52,
} as const;

// Response status codes
export const STATUS_CODES = {
  SUCCESS: 0x9000,
  WRONG_LENGTH: 0x6700,
  SECURITY_NOT_SATISFIED: 0x6982,
  CONDITIONS_NOT_SATISFIED: 0x6985,
  WRONG_DATA: 0x6a80,
  FILE_NOT_FOUND: 0x6a82,
  INCORRECT_PARAMS: 0x6a86,
  INS_NOT_SUPPORTED: 0x6d00,
  CLA_NOT_SUPPORTED: 0x6e00,
  UNKNOWN_ERROR: 0x6f00,
  USER_REJECTED: 0x6986,
  PIN_BLOCKED: 0x6983,
  INVALID_PIN: 0x63c0,
} as const;

// Error codes mapping
export const ERROR_CODES: Record<number, string> = {
  [STATUS_CODES.SUCCESS]: 'Success',
  [STATUS_CODES.WRONG_LENGTH]: 'Wrong data length',
  [STATUS_CODES.SECURITY_NOT_SATISFIED]: 'Security conditions not satisfied',
  [STATUS_CODES.CONDITIONS_NOT_SATISFIED]: 'Conditions not satisfied',
  [STATUS_CODES.WRONG_DATA]: 'Invalid data',
  [STATUS_CODES.FILE_NOT_FOUND]: 'File or account not found',
  [STATUS_CODES.INCORRECT_PARAMS]: 'Incorrect parameters',
  [STATUS_CODES.INS_NOT_SUPPORTED]: 'Instruction not supported',
  [STATUS_CODES.CLA_NOT_SUPPORTED]: 'Class not supported',
  [STATUS_CODES.UNKNOWN_ERROR]: 'Unknown error',
  [STATUS_CODES.USER_REJECTED]: 'User rejected the operation',
  [STATUS_CODES.PIN_BLOCKED]: 'PIN is blocked',
  [STATUS_CODES.INVALID_PIN]: 'Invalid PIN',
};

// APDU structure
export const APDU = {
  CLA_DCENT: 0xe0,
  MIN_RESPONSE_LENGTH: 2,
  SW1_SUCCESS: 0x90,
  SW2_SUCCESS: 0x00,
} as const;

export function getErrorMessage(statusCode: number): string {
  return ERROR_CODES[statusCode] ?? `Unknown error code: 0x${statusCode.toString(16)}`;
}

export function isSuccessStatus(statusCode: number): boolean {
  return statusCode === STATUS_CODES.SUCCESS;
}
