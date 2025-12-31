/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	COMMANDS,
	CONNECTION_TYPES,
	COIN_TYPES,
	DEVICE_STATUS,
	DEVICE_MODELS,
	STATUS_CODES,
	BITCOIN_LIKE_COINS,
	EVM_CHAINS,
	SUPPORTED_COINS,
} from '../../nodes/DCent/constants';

describe('DCent Constants', () => {
	describe('COMMANDS', () => {
		it('should have all required commands defined', () => {
			expect(COMMANDS.GET_INFO).toBeDefined();
			expect(COMMANDS.GET_ADDRESS).toBeDefined();
			expect(COMMANDS.SIGN_TX).toBeDefined();
		});

		it('should have unique command values', () => {
			const values = Object.values(COMMANDS);
			const uniqueValues = new Set(values);
			expect(uniqueValues.size).toBe(values.length);
		});
	});

	describe('CONNECTION_TYPES', () => {
		it('should have all connection types', () => {
			expect(CONNECTION_TYPES.USB).toBe('usb');
			expect(CONNECTION_TYPES.BLUETOOTH).toBe('bluetooth');
			expect(CONNECTION_TYPES.BRIDGE).toBe('bridge');
			expect(CONNECTION_TYPES.NFC).toBe('nfc');
		});
	});

	describe('COIN_TYPES', () => {
		it('should have major cryptocurrencies', () => {
			expect(COIN_TYPES.BITCOIN).toBeDefined();
			expect(COIN_TYPES.ETHEREUM).toBeDefined();
			expect(COIN_TYPES.LITECOIN).toBeDefined();
		});
	});

	describe('DEVICE_STATUS', () => {
		it('should have all status states', () => {
			expect(DEVICE_STATUS.DISCONNECTED).toBeDefined();
			expect(DEVICE_STATUS.INITIALIZING).toBeDefined();
			expect(DEVICE_STATUS.READY).toBeDefined();
			expect(DEVICE_STATUS.ERROR).toBeDefined();
		});
	});

	describe('DEVICE_MODELS', () => {
		it('should have D\'CENT device models', () => {
			expect(DEVICE_MODELS.BIOMETRIC).toBeDefined();
			expect(DEVICE_MODELS.CARD).toBeDefined();
		});
	});

	describe('STATUS_CODES', () => {
		it('should have success code', () => {
			expect(STATUS_CODES.SUCCESS).toBe(0x9000);
		});

		it('should have error codes', () => {
			expect(STATUS_CODES.CONDITIONS_NOT_SATISFIED).toBeDefined();
			expect(STATUS_CODES.USER_REJECTED).toBeDefined();
		});

		it('should have unique status codes', () => {
			const values = Object.values(STATUS_CODES);
			const uniqueValues = new Set(values);
			expect(uniqueValues.size).toBe(values.length);
		});
	});

	describe('BITCOIN_LIKE_COINS', () => {
		it('should include Bitcoin and related coins', () => {
			expect(BITCOIN_LIKE_COINS).toContain('bitcoin');
			expect(BITCOIN_LIKE_COINS).toContain('litecoin');
			expect(BITCOIN_LIKE_COINS).toContain('dogecoin');
		});

		it('should be a readonly array', () => {
			expect(Array.isArray(BITCOIN_LIKE_COINS)).toBe(true);
		});
	});

	describe('EVM_CHAINS', () => {
		it('should include major EVM chains', () => {
			expect(EVM_CHAINS).toContain('ethereum');
			expect(EVM_CHAINS).toContain('polygon');
			expect(EVM_CHAINS).toContain('arbitrum');
		});

		it('should have correct chain IDs via SUPPORTED_COINS', () => {
			expect(SUPPORTED_COINS.ethereum.chainId).toBe(1);
			expect(SUPPORTED_COINS.polygon.chainId).toBe(137);
		});
	});
});
