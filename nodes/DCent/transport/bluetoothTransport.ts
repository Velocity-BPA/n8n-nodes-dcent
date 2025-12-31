/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Bluetooth Transport
 * Handles Bluetooth Low Energy communication with D'CENT Biometric Wallet
 */

import { BLE } from '../constants';

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  isConnectable: boolean;
}

export interface BluetoothTransportOptions {
  deviceId?: string;
  timeout?: number;
  autoReconnect?: boolean;
}

export type BluetoothEventHandler = (event: BluetoothEvent) => void;

export interface BluetoothEvent {
  type: 'discovered' | 'connected' | 'disconnected' | 'data' | 'error';
  device?: BluetoothDevice;
  data?: Buffer;
  error?: string;
}

/**
 * Bluetooth Transport Class
 */
export class BluetoothTransport {
  private deviceId: string | null = null;
  private peripheral: unknown = null;
  private txCharacteristic: unknown = null;
  private _rxCharacteristic: unknown = null;
  private isConnected: boolean = false;
  private timeout: number;
  private autoReconnect: boolean;
  private eventHandlers: Set<BluetoothEventHandler> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private responseBuffer: Buffer = Buffer.alloc(0);

  constructor(options: BluetoothTransportOptions = {}) {
    this.deviceId = options.deviceId ?? null;
    this.timeout = options.timeout ?? BLE.CONNECTION_TIMEOUT_MS;
    this.autoReconnect = options.autoReconnect ?? false;
  }

  /**
   * Start scanning for D'CENT devices
   */
  async startScan(duration: number = BLE.SCAN_TIMEOUT_MS): Promise<BluetoothDevice[]> {
    const devices: BluetoothDevice[] = [];

    try {
      // Note: noble library would be used in actual implementation
      // This is a placeholder that simulates discovery
      const noble = require('@abandonware/noble');

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          noble.stopScanning();
          resolve(devices);
        }, duration);

        noble.on('discover', (peripheral: {
          id: string;
          advertisement: { localName: string };
          rssi: number;
          connectable: boolean;
        }) => {
          const name = peripheral.advertisement.localName;

          // Filter for D'CENT devices
          if (name && BLE.DEVICE_NAME_PATTERN.test(name)) {
            devices.push({
              id: peripheral.id,
              name,
              rssi: peripheral.rssi,
              isConnectable: peripheral.connectable,
            });

            this.emitEvent({
              type: 'discovered',
              device: devices[devices.length - 1],
            });
          }
        });

        noble.on('stateChange', (state: string) => {
          if (state === 'poweredOn') {
            noble.startScanning([BLE.SERVICE_UUID], false);
          } else {
            clearTimeout(timeoutId);
            reject(new Error(`Bluetooth state: ${state}`));
          }
        });
      });
    } catch (error) {
      throw new Error(
        `Bluetooth scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Stop scanning
   */
  async stopScan(): Promise<void> {
    try {
      const noble = require('@abandonware/noble');
      noble.stopScanning();
    } catch {
      // Ignore errors
    }
  }

  /**
   * Connect to a device
   */
  async connect(deviceId?: string): Promise<void> {
    const id = deviceId ?? this.deviceId;
    if (!id) {
      throw new Error('Device ID is required');
    }

    if (this.isConnected) {
      throw new Error('Already connected');
    }

    try {
      const noble = require('@abandonware/noble');

      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, this.timeout);

        noble.on('discover', async (peripheral: unknown & {
          id: string;
          connect: (callback: (error?: Error) => void) => void;
          discoverAllServicesAndCharacteristics: (
            callback: (
              error: Error | null,
              services: unknown[],
              characteristics: Array<{
                uuid: string;
                subscribe: (callback: (error?: Error) => void) => void;
                on: (event: string, callback: (data: Buffer, isNotification: boolean) => void) => void;
              }>,
            ) => void,
          ) => void;
        }) => {
          if (peripheral.id === id) {
            noble.stopScanning();

            peripheral.connect((error?: Error) => {
              if (error) {
                clearTimeout(timeoutId);
                reject(error);
                return;
              }

              peripheral.discoverAllServicesAndCharacteristics(
                (err, _services, characteristics) => {
                  clearTimeout(timeoutId);

                  if (err) {
                    reject(err);
                    return;
                  }

                  // Find TX and RX characteristics
                  for (const char of characteristics) {
                    if (char.uuid === BLE.TX_CHARACTERISTIC_UUID.replace(/-/g, '')) {
                      this.txCharacteristic = char;
                    }
                    if (char.uuid === BLE.RX_CHARACTERISTIC_UUID.replace(/-/g, '')) {
                      this._rxCharacteristic = char;
                      
                      // Subscribe to notifications
                      char.subscribe((subError?: Error) => {
                        if (subError) {
                          console.error('Subscribe error:', subError);
                        }
                      });

                      char.on('data', (data: Buffer, isNotification: boolean) => {
                        if (isNotification) {
                          this.handleNotification(data);
                        }
                      });
                    }
                  }

                  this.peripheral = peripheral;
                  this.deviceId = id;
                  this.isConnected = true;

                  this.emitEvent({ type: 'connected' });
                  resolve();
                },
              );
            });
          }
        });

        noble.startScanning([BLE.SERVICE_UUID], false);
      });
    } catch (error) {
      throw new Error(
        `Bluetooth connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    this.stopReconnect();

    if (!this.peripheral) {
      return;
    }

    try {
      const peripheral = this.peripheral as { disconnect: (callback: () => void) => void };
      await new Promise<void>((resolve) => {
        peripheral.disconnect(() => {
          resolve();
        });
      });
    } catch {
      // Ignore errors
    }

    this.peripheral = null;
    this.txCharacteristic = null;
    this._rxCharacteristic = null;
    this.isConnected = false;
    this.deviceId = null;

    this.emitEvent({ type: 'disconnected' });
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.isConnected;
  }

  /**
   * Send command and receive response
   */
  async sendCommand(ins: number, data?: Buffer): Promise<Buffer> {
    if (!this.isConnected || !this.txCharacteristic) {
      throw new Error('Not connected');
    }

    const command = this.buildCommand(ins, data);
    const packets = this.packetize(command);

    // Clear response buffer
    this.responseBuffer = Buffer.alloc(0);

    // Send all packets
    for (const packet of packets) {
      await this.writePacket(packet);
    }

    // Wait for response
    return this.waitForResponse();
  }

  /**
   * Get signal strength (RSSI)
   */
  async getSignalStrength(): Promise<number> {
    if (!this.peripheral) {
      throw new Error('Not connected');
    }

    const peripheral = this.peripheral as {
      updateRssi: (callback: (error: Error | null, rssi: number) => void) => void;
    };

    return new Promise((resolve, reject) => {
      peripheral.updateRssi((error, rssi) => {
        if (error) {
          reject(error);
        } else {
          resolve(rssi);
        }
      });
    });
  }

  /**
   * Register event handler
   */
  on(handler: BluetoothEventHandler): void {
    this.eventHandlers.add(handler);
  }

  /**
   * Remove event handler
   */
  off(handler: BluetoothEventHandler): void {
    this.eventHandlers.delete(handler);
  }

  // Private methods

  private buildCommand(ins: number, data?: Buffer): Buffer {
    const dataLength = data?.length ?? 0;
    const buffer = Buffer.alloc(4 + dataLength);

    buffer.writeUInt8(0xe0, 0); // CLA
    buffer.writeUInt8(ins, 1); // INS
    buffer.writeUInt8(0x00, 2); // P1
    buffer.writeUInt8(0x00, 3); // P2

    if (data) {
      data.copy(buffer, 4);
    }

    return buffer;
  }

  private packetize(data: Buffer): Buffer[] {
    const packets: Buffer[] = [];
    const maxDataSize = BLE.MTU_SIZE - 3; // Account for header
    let offset = 0;
    let sequenceNumber = 0;

    while (offset < data.length) {
      const chunkSize = Math.min(data.length - offset, maxDataSize);
      const packet = Buffer.alloc(chunkSize + 3);

      packet.writeUInt8(0x00, 0); // Channel ID
      packet.writeUInt8(sequenceNumber++, 1); // Sequence
      packet.writeUInt8(chunkSize, 2); // Length

      data.copy(packet, 3, offset, offset + chunkSize);

      packets.push(packet);
      offset += chunkSize;
    }

    return packets;
  }

  private async writePacket(packet: Buffer): Promise<void> {
    if (!this.txCharacteristic) {
      throw new Error('TX characteristic not available');
    }

    const tx = this.txCharacteristic as {
      write: (data: Buffer, withoutResponse: boolean, callback: (error?: Error) => void) => void;
    };

    return new Promise((resolve, reject) => {
      tx.write(packet, false, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private handleNotification(data: Buffer): void {
    this.responseBuffer = Buffer.concat([this.responseBuffer, data]);

    this.emitEvent({
      type: 'data',
      data,
    });
  }

  private async waitForResponse(timeoutMs: number = this.timeout): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkResponse = () => {
        // Check if we have a complete response
        if (this.responseBuffer.length >= 2) {
          const response = this.responseBuffer;
          this.responseBuffer = Buffer.alloc(0);
          resolve(response);
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Response timeout'));
          return;
        }

        setTimeout(checkResponse, 50);
      };

      checkResponse();
    });
  }

  private _startReconnect(): void {
    if (!this.autoReconnect || this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setInterval(async () => {
      if (!this.isConnected && this.deviceId) {
        try {
          await this.connect(this.deviceId);
        } catch {
          // Ignore reconnect errors
        }
      }
    }, 5000);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emitEvent(event: BluetoothEvent): void {
    this.eventHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Bluetooth event handler error:', error);
      }
    });
  }
}

export default BluetoothTransport;
