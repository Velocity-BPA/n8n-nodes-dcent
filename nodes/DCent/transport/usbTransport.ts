/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT USB HID Transport
 * Handles USB communication with D'CENT hardware wallets
 */

import { USB_HID, COMMANDS, STATUS_CODES, APDU, getErrorMessage } from '../constants';

export interface UsbDevice {
  path: string;
  vendorId: number;
  productId: number;
  serialNumber?: string;
  manufacturer?: string;
  product?: string;
}

export interface UsbTransportOptions {
  devicePath?: string;
  timeout?: number;
}

export interface ApduCommand {
  cla: number;
  ins: number;
  p1: number;
  p2: number;
  data?: Buffer;
  le?: number;
}

export interface ApduResponse {
  data: Buffer;
  sw1: number;
  sw2: number;
  statusWord: number;
}

/**
 * USB HID Transport Class
 */
export class UsbTransport {
  private device: unknown = null;
  private devicePath: string | null = null;
  private timeout: number;
  private isOpen: boolean = false;

  constructor(options: UsbTransportOptions = {}) {
    this.timeout = options.timeout ?? USB_HID.TIMEOUT_MS;
    this.devicePath = options.devicePath ?? null;
  }

  /**
   * List available D'CENT USB devices
   */
  static listDevices(): UsbDevice[] {
    try {
      const HID = require('node-hid');
      const devices = HID.devices() as UsbDevice[];

      return devices.filter(
        (device) =>
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
   * Open connection to device
   */
  async open(devicePath?: string): Promise<void> {
    if (this.isOpen) {
      throw new Error('Device already open');
    }

    const path = devicePath ?? this.devicePath;

    try {
      const HID = require('node-hid');

      if (path) {
        this.device = new HID.HID(path);
      } else {
        // Find first available D'CENT device
        const devices = UsbTransport.listDevices();
        if (devices.length === 0) {
          throw new Error('No D\'CENT device found');
        }
        this.device = new HID.HID(devices[0].path);
        this.devicePath = devices[0].path;
      }

      this.isOpen = true;
    } catch (error) {
      throw new Error(
        `Failed to open USB device: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (!this.isOpen || !this.device) {
      return;
    }

    try {
      (this.device as { close: () => void }).close();
    } catch {
      // Ignore close errors
    }

    this.device = null;
    this.isOpen = false;
  }

  /**
   * Check if device is open
   */
  isConnected(): boolean {
    return this.isOpen && this.device !== null;
  }

  /**
   * Send APDU command and receive response
   */
  async sendApdu(command: ApduCommand): Promise<ApduResponse> {
    if (!this.isConnected()) {
      throw new Error('Device not connected');
    }

    const apduBuffer = this.buildApdu(command);
    const packetizedData = this.packetize(apduBuffer);

    // Send all packets
    for (const packet of packetizedData) {
      await this.writePacket(packet);
    }

    // Read response
    const response = await this.readResponse();

    return this.parseApduResponse(response);
  }

  /**
   * Send raw command
   */
  async sendCommand(ins: number, data?: Buffer): Promise<ApduResponse> {
    return this.sendApdu({
      cla: APDU.CLA_DCENT,
      ins,
      p1: 0x00,
      p2: 0x00,
      data,
    });
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<{
    model: string;
    firmwareVersion: string;
    serialNumber: string;
  }> {
    const response = await this.sendCommand(COMMANDS.GET_INFO);

    if (response.statusWord !== STATUS_CODES.SUCCESS) {
      throw new Error(getErrorMessage(response.statusWord));
    }

    // Parse device info from response
    // Format depends on D'CENT protocol specification
    const data = response.data;

    return {
      model: this.parseString(data, 0, 16),
      firmwareVersion: this.parseString(data, 16, 8),
      serialNumber: this.parseString(data, 24, 16),
    };
  }

  /**
   * Ping device
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.sendCommand(COMMANDS.PING);
      return response.statusWord === STATUS_CODES.SUCCESS;
    } catch {
      return false;
    }
  }

  // Private methods

  private buildApdu(command: ApduCommand): Buffer {
    const dataLength = command.data?.length ?? 0;
    const hasLe = command.le !== undefined;

    // Calculate total length
    const length = 4 + (dataLength > 0 ? 1 + dataLength : 0) + (hasLe ? 1 : 0);
    const buffer = Buffer.alloc(length);

    let offset = 0;

    // Header
    buffer.writeUInt8(command.cla, offset++);
    buffer.writeUInt8(command.ins, offset++);
    buffer.writeUInt8(command.p1, offset++);
    buffer.writeUInt8(command.p2, offset++);

    // Data
    if (dataLength > 0 && command.data) {
      buffer.writeUInt8(dataLength, offset++);
      command.data.copy(buffer, offset);
      offset += dataLength;
    }

    // Le
    if (hasLe) {
      buffer.writeUInt8(command.le!, offset);
    }

    return buffer;
  }

  private packetize(data: Buffer): Buffer[] {
    const packets: Buffer[] = [];
    const packetSize = USB_HID.PACKET_SIZE;
    let offset = 0;
    let sequenceNumber = 0;

    while (offset < data.length) {
      const packet = Buffer.alloc(packetSize);
      let packetOffset = 0;

      // First byte is report ID (0x00 for D'CENT)
      packet.writeUInt8(0x00, packetOffset++);

      // Second byte is sequence number
      packet.writeUInt8(sequenceNumber++, packetOffset++);

      // Remaining bytes are data
      const chunkSize = Math.min(data.length - offset, packetSize - packetOffset);
      data.copy(packet, packetOffset, offset, offset + chunkSize);

      packets.push(packet);
      offset += chunkSize;
    }

    return packets;
  }

  private async writePacket(packet: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const device = this.device as { write: (data: number[]) => number };
        device.write(Array.from(packet));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async readResponse(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Read timeout'));
      }, this.timeout);

      try {
        const device = this.device as {
          read: (callback: (error: Error | null, data: Buffer) => void) => void;
        };

        const chunks: Buffer[] = [];

        const readChunk = () => {
          device.read((error, data) => {
            if (error) {
              clearTimeout(timeoutId);
              reject(error);
              return;
            }

            chunks.push(data);

            // Check if we have complete response
            // This logic depends on D'CENT protocol
            const totalData = Buffer.concat(chunks);
            if (this.isCompleteResponse(totalData)) {
              clearTimeout(timeoutId);
              resolve(this.depacketize(chunks));
            } else {
              readChunk();
            }
          });
        };

        readChunk();
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private isCompleteResponse(data: Buffer): boolean {
    // Check if response is complete based on D'CENT protocol
    // Minimum response is 2 bytes (SW1 + SW2)
    return data.length >= APDU.MIN_RESPONSE_LENGTH;
  }

  private depacketize(packets: Buffer[]): Buffer {
    // Combine packets into single response, removing headers
    const dataChunks: Buffer[] = [];

    for (const packet of packets) {
      // Skip first 2 bytes (report ID and sequence number)
      dataChunks.push(packet.slice(2));
    }

    return Buffer.concat(dataChunks);
  }

  private parseApduResponse(data: Buffer): ApduResponse {
    if (data.length < 2) {
      throw new Error('Invalid APDU response');
    }

    const sw1 = data.readUInt8(data.length - 2);
    const sw2 = data.readUInt8(data.length - 1);
    const statusWord = (sw1 << 8) | sw2;

    return {
      data: data.slice(0, data.length - 2),
      sw1,
      sw2,
      statusWord,
    };
  }

  private parseString(data: Buffer, offset: number, maxLength: number): string {
    const end = Math.min(offset + maxLength, data.length);
    const nullIndex = data.indexOf(0x00, offset);
    const actualEnd = nullIndex >= offset && nullIndex < end ? nullIndex : end;

    return data.toString('utf8', offset, actualEnd).trim();
  }
}

export default UsbTransport;
