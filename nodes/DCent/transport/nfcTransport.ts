/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT NFC Transport
 * Handles NFC communication with D'CENT Card Wallet
 */

import { NFC } from '../constants';

/**
 * Get error message from status code
 */
function getErrorMessage(statusCode: number): string {
  const errorMessages: Record<number, string> = {
    0x9000: 'Success',
    0x6700: 'Wrong data length',
    0x6982: 'Security conditions not satisfied',
    0x6985: 'Conditions not satisfied',
    0x6a80: 'Invalid data',
    0x6a82: 'File or account not found',
    0x6d00: 'Instruction not supported',
    0x6e00: 'Class not supported',
    0x6f00: 'Unknown error',
  };
  return errorMessages[statusCode] || `Unknown error code: 0x${statusCode.toString(16)}`;
}

export interface NfcCard {
  uid: string;
  atr: string;
  protocol: string;
  isAuthenticated: boolean;
}

export interface NfcTransportOptions {
  timeout?: number;
  autoConnect?: boolean;
}

export type NfcEventHandler = (event: NfcEvent) => void;

export interface NfcEvent {
  type: 'card_present' | 'card_removed' | 'data' | 'error';
  card?: NfcCard;
  data?: Buffer;
  error?: string;
}

/**
 * NFC Transport Class
 * Note: NFC communication typically requires platform-specific implementations
 * This is designed to work with standard NFC reader APIs
 */
export class NfcTransport {
  private _reader: unknown = null;
  private card: NfcCard | null = null;
  private isConnected: boolean = false;
  private timeout: number;
  private _autoConnect: boolean;
  private eventHandlers: Set<NfcEventHandler> = new Set();

  constructor(options: NfcTransportOptions = {}) {
    this.timeout = options.timeout ?? NFC.TIMEOUT_MS;
    this._autoConnect = options.autoConnect ?? true;
  }

  /**
   * Initialize NFC reader
   */
  async initialize(): Promise<void> {
    try {
      // Platform-specific NFC initialization
      // This would use libraries like 'nfc-pcsc' or similar
      // Placeholder implementation
      this._reader = { initialized: true };
    } catch (error) {
      throw new Error(
        `NFC initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Wait for card to be presented
   */
  async waitForCard(timeoutMs: number = this.timeout): Promise<NfcCard> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Card scan timeout'));
      }, timeoutMs);

      // In actual implementation, this would listen for NFC events
      // Simulated card detection
      const checkCard = async () => {
        try {
          const card = await this.detectCard();
          if (card) {
            clearTimeout(timeoutId);
            this.card = card;
            this.isConnected = true;

            this.emitEvent({
              type: 'card_present',
              card,
            });

            resolve(card);
          } else {
            setTimeout(checkCard, 100);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };

      checkCard();
    });
  }

  /**
   * Detect if a card is present
   */
  async detectCard(): Promise<NfcCard | null> {
    // Platform-specific card detection
    // This would interact with the NFC reader
    return null;
  }

  /**
   * Connect to the card and select D'CENT applet
   */
  async connect(): Promise<void> {
    if (!this.card) {
      throw new Error('No card present');
    }

    if (this.isConnected) {
      return;
    }

    try {
      // Select D'CENT applet using AID
      const selectApdu = this.buildSelectApdu([...NFC.AID]);
      const response = await this.transmit(selectApdu);

      if (response.sw !== 0x9000) {
        throw new Error('Failed to select D\'CENT applet');
      }

      this.isConnected = true;
    } catch (error) {
      throw new Error(
        `NFC connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Disconnect from card
   */
  async disconnect(): Promise<void> {
    if (this.card) {
      this.emitEvent({
        type: 'card_removed',
        card: this.card,
      });
    }

    this.card = null;
    this.isConnected = false;
  }

  /**
   * Check if card is connected
   */
  connected(): boolean {
    return this.isConnected && this.card !== null;
  }

  /**
   * Get current card info
   */
  getCard(): NfcCard | null {
    return this.card;
  }

  /**
   * Send APDU command to card
   */
  async sendApdu(cla: number, ins: number, p1: number, p2: number, data?: Buffer): Promise<{
    data: Buffer;
    sw: number;
  }> {
    if (!this.connected()) {
      throw new Error('Card not connected');
    }

    const apdu = this.buildApdu(cla, ins, p1, p2, data);
    return this.transmit(apdu);
  }

  /**
   * Send command to card
   */
  async sendCommand(ins: number, data?: Buffer): Promise<Buffer> {
    const response = await this.sendApdu(0xe0, ins, 0x00, 0x00, data);

    if (response.sw !== 0x9000) {
      throw new Error(getErrorMessage(response.sw));
    }

    return response.data;
  }

  /**
   * Get card UID
   */
  async getCardUid(): Promise<string> {
    if (!this.card) {
      throw new Error('No card present');
    }
    return this.card.uid;
  }

  /**
   * Read data from card
   */
  async readData(offset: number, length: number): Promise<Buffer> {
    const response = await this.sendApdu(
      0x00,
      NFC.READ_COMMAND,
      (offset >> 8) & 0xff,
      offset & 0xff,
      Buffer.from([length]),
    );

    if (response.sw !== 0x9000) {
      throw new Error(`Read failed: ${getErrorMessage(response.sw)}`);
    }

    return response.data;
  }

  /**
   * Sign data using card
   */
  async sign(data: Buffer): Promise<Buffer> {
    const response = await this.sendApdu(0xe0, NFC.SIGN_COMMAND, 0x00, 0x00, data);

    if (response.sw !== 0x9000) {
      throw new Error(`Signing failed: ${getErrorMessage(response.sw)}`);
    }

    return response.data;
  }

  /**
   * Register event handler
   */
  on(handler: NfcEventHandler): void {
    this.eventHandlers.add(handler);
  }

  /**
   * Remove event handler
   */
  off(handler: NfcEventHandler): void {
    this.eventHandlers.delete(handler);
  }

  /**
   * Close NFC reader
   */
  async close(): Promise<void> {
    await this.disconnect();
    this._reader = null;
    this.eventHandlers.clear();
  }

  // Private methods

  private buildSelectApdu(aid: number[]): Buffer {
    const aidBuffer = Buffer.from(aid);
    const apdu = Buffer.alloc(5 + aidBuffer.length);

    apdu.writeUInt8(0x00, 0); // CLA
    apdu.writeUInt8(NFC.SELECT_COMMAND, 1); // INS
    apdu.writeUInt8(0x04, 2); // P1: Select by name
    apdu.writeUInt8(0x00, 3); // P2
    apdu.writeUInt8(aidBuffer.length, 4); // Lc

    aidBuffer.copy(apdu, 5);

    return apdu;
  }

  private buildApdu(cla: number, ins: number, p1: number, p2: number, data?: Buffer): Buffer {
    const dataLength = data?.length ?? 0;
    const apdu = Buffer.alloc(5 + dataLength);

    apdu.writeUInt8(cla, 0);
    apdu.writeUInt8(ins, 1);
    apdu.writeUInt8(p1, 2);
    apdu.writeUInt8(p2, 3);
    apdu.writeUInt8(dataLength, 4);

    if (data) {
      data.copy(apdu, 5);
    }

    return apdu;
  }

  private async transmit(_apdu: Buffer): Promise<{ data: Buffer; sw: number }> {
    // Platform-specific APDU transmission
    // This would send the APDU to the card and receive the response

    // Placeholder implementation
    return new Promise((_resolve, reject) => {
      setTimeout(() => {
        // Simulated response
        reject(new Error('NFC transmit not implemented'));
      }, 100);
    });
  }

  private emitEvent(event: NfcEvent): void {
    this.eventHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('NFC event handler error:', error);
      }
    });
  }
}

export default NfcTransport;
