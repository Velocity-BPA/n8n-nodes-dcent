/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Connection Manager
 * Unified interface for managing device connections across all transports
 */

import { CONNECTION_TYPES, DEVICE_STATUS, DEVICE_MODELS } from '../constants';
import type { ConnectionType, DeviceStatus, DeviceModel } from '../constants';
import { createConnectionState, updateConnectionState, type ConnectionState } from '../utils/connectionUtils';

export interface DCentDevice {
  id: string;
  model: DeviceModel;
  serialNumber?: string;
  firmwareVersion?: string;
  label?: string;
  connectionType: ConnectionType;
  isConnected: boolean;
}

export interface ConnectionOptions {
  connectionType: ConnectionType;
  devicePath?: string;
  bluetoothId?: string;
  bridgeUrl?: string;
  timeout?: number;
  autoReconnect?: boolean;
}

export interface CommandResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export type ConnectionEventHandler = (event: ConnectionEvent) => void;

export interface ConnectionEvent {
  type: 'connected' | 'disconnected' | 'error' | 'status_change';
  device?: DCentDevice;
  error?: string;
  previousStatus?: DeviceStatus;
  newStatus?: DeviceStatus;
}

/**
 * D'CENT Connection Manager Class
 * Manages device connections and command execution
 */
export class DCentConnectionManager {
  private static instance: DCentConnectionManager | null = null;
  private connectionState: ConnectionState;
  private currentDevice: DCentDevice | null = null;
  private eventHandlers: Set<ConnectionEventHandler> = new Set();
  private connectionOptions: ConnectionOptions | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.connectionState = createConnectionState();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DCentConnectionManager {
    if (!DCentConnectionManager.instance) {
      DCentConnectionManager.instance = new DCentConnectionManager();
    }
    return DCentConnectionManager.instance;
  }

  /**
   * Connect to a D'CENT device
   */
  async connect(options: ConnectionOptions): Promise<CommandResult<DCentDevice>> {
    this.connectionOptions = options;

    try {
      this.updateStatus(DEVICE_STATUS.INITIALIZING);

      let device: DCentDevice;

      switch (options.connectionType) {
        case CONNECTION_TYPES.USB:
          device = await this.connectUsb(options);
          break;
        case CONNECTION_TYPES.BLUETOOTH:
          device = await this.connectBluetooth(options);
          break;
        case CONNECTION_TYPES.NFC:
          device = await this.connectNfc(options);
          break;
        case CONNECTION_TYPES.BRIDGE:
          device = await this.connectBridge(options);
          break;
        default:
          throw new Error(`Unsupported connection type: ${options.connectionType}`);
      }

      this.currentDevice = device;
      this.connectionState = updateConnectionState(this.connectionState, {
        connected: true,
        status: DEVICE_STATUS.READY,
        connectionType: options.connectionType,
        deviceId: device.id,
      });

      this.emitEvent({
        type: 'connected',
        device,
      });

      return { success: true, data: device };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      this.updateStatus(DEVICE_STATUS.ERROR, errorMessage);

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<CommandResult> {
    if (!this.currentDevice) {
      return { success: true };
    }

    try {
      this.stopReconnect();

      // Perform transport-specific cleanup
      switch (this.connectionState.connectionType) {
        case CONNECTION_TYPES.USB:
          await this.disconnectUsb();
          break;
        case CONNECTION_TYPES.BLUETOOTH:
          await this.disconnectBluetooth();
          break;
        case CONNECTION_TYPES.NFC:
          await this.disconnectNfc();
          break;
        case CONNECTION_TYPES.BRIDGE:
          await this.disconnectBridge();
          break;
      }

      const previousDevice = this.currentDevice;
      this.currentDevice = null;
      this.connectionState = updateConnectionState(this.connectionState, {
        connected: false,
        status: DEVICE_STATUS.DISCONNECTED,
        connectionType: undefined,
        deviceId: undefined,
      });

      this.emitEvent({
        type: 'disconnected',
        device: previousDevice,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Disconnect failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a command to the device
   */
  async sendCommand<T>(command: string, data?: Record<string, unknown>): Promise<T> {
    if (!this.isConnected()) {
      throw new Error('Device not connected');
    }

    try {
      // Implementation would vary based on connection type
      // This is a placeholder for the actual command sending logic
      const result = await this.executeCommand<T>(command, data);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<CommandResult<DCentDevice>> {
    if (!this.currentDevice) {
      return { success: false, error: 'No device connected' };
    }

    return { success: true, data: this.currentDevice };
  }

  /**
   * Check if device is connected
   */
  isConnected(): boolean {
    return this.connectionState.connected && this.currentDevice !== null;
  }

  /**
   * Get current connection status
   */
  getStatus(): DeviceStatus {
    return this.connectionState.status;
  }

  /**
   * Get current device
   */
  getDevice(): DCentDevice | null {
    return this.currentDevice;
  }

  /**
   * Get current connection type
   */
  getConnectionType(): ConnectionType | null {
    return this.connectionState.connectionType || null;
  }

  /**
   * Register event handler
   */
  on(handler: ConnectionEventHandler): void {
    this.eventHandlers.add(handler);
  }

  /**
   * Remove event handler
   */
  off(handler: ConnectionEventHandler): void {
    this.eventHandlers.delete(handler);
  }

  // Private methods

  private async connectUsb(_options: ConnectionOptions): Promise<DCentDevice> {
    // USB HID connection implementation
    // In production, this would use node-hid to connect to the device
    
    return {
      id: `usb_${Date.now()}`,
      model: DEVICE_MODELS.BIOMETRIC,
      connectionType: CONNECTION_TYPES.USB,
      isConnected: true,
    };
  }

  private async connectBluetooth(options: ConnectionOptions): Promise<DCentDevice> {
    if (!options.bluetoothId) {
      throw new Error('Bluetooth device ID is required');
    }

    // Bluetooth connection implementation
    // In production, this would use noble or similar library
    
    return {
      id: options.bluetoothId,
      model: DEVICE_MODELS.BIOMETRIC,
      connectionType: CONNECTION_TYPES.BLUETOOTH,
      isConnected: true,
    };
  }

  private async connectNfc(_options: ConnectionOptions): Promise<DCentDevice> {
    // NFC connection implementation for Card Wallet
    
    return {
      id: `nfc_${Date.now()}`,
      model: DEVICE_MODELS.CARD,
      connectionType: CONNECTION_TYPES.NFC,
      isConnected: true,
    };
  }

  private async connectBridge(options: ConnectionOptions): Promise<DCentDevice> {
    const bridgeUrl = options.bridgeUrl || 'http://127.0.0.1:9527';

    // Check if bridge is available
    const response = await fetch(`${bridgeUrl}/info`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error('D\'CENT Bridge is not available');
    }

    const bridgeInfo = await response.json() as {
      deviceId?: string;
      deviceModel?: DeviceModel;
      serialNumber?: string;
      firmwareVersion?: string;
    };

    return {
      id: bridgeInfo.deviceId || `bridge_${Date.now()}`,
      model: bridgeInfo.deviceModel || DEVICE_MODELS.BIOMETRIC,
      serialNumber: bridgeInfo.serialNumber,
      firmwareVersion: bridgeInfo.firmwareVersion,
      connectionType: CONNECTION_TYPES.BRIDGE,
      isConnected: true,
    };
  }

  private async disconnectUsb(): Promise<void> {
    // USB cleanup
  }

  private async disconnectBluetooth(): Promise<void> {
    // Bluetooth cleanup
  }

  private async disconnectNfc(): Promise<void> {
    // NFC cleanup
  }

  private async disconnectBridge(): Promise<void> {
    // Bridge cleanup
  }

  private async executeCommand<T>(_command: string, _data?: Record<string, unknown>): Promise<T> {
    // Command execution implementation
    // This would be implemented based on the connection type
    throw new Error('Command execution not implemented');
  }

  private updateStatus(status: DeviceStatus, error?: string): void {
    const previousStatus = this.connectionState.status;
    this.connectionState = updateConnectionState(this.connectionState, {
      status,
      error,
    });

    this.emitEvent({
      type: 'status_change',
      previousStatus,
      newStatus: status,
    });
  }

  private emitEvent(event: ConnectionEvent): void {
    this.eventHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        // Log error but don't throw
        console.error('Event handler error:', error);
      }
    });
  }

  private _startReconnect(): void {
    if (!this.connectionOptions?.autoReconnect) return;

    this.reconnectTimer = setInterval(async () => {
      if (!this.isConnected() && this.connectionOptions) {
        await this.connect(this.connectionOptions);
      }
    }, 5000);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Export singleton instance
export const connectionManager = new DCentConnectionManager();
