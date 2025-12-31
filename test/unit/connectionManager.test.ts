/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { DCentConnectionManager } from '../../nodes/DCent/transport/connectionManager';

describe('DCentConnectionManager', () => {
	let manager: DCentConnectionManager;

	beforeEach(() => {
		manager = DCentConnectionManager.getInstance();
	});

	afterEach(async () => {
		if (manager.isConnected()) {
			await manager.disconnect();
		}
	});

	describe('getInstance', () => {
		it('should return a singleton instance', () => {
			const instance1 = DCentConnectionManager.getInstance();
			const instance2 = DCentConnectionManager.getInstance();
			expect(instance1).toBe(instance2);
		});
	});

	describe('connection state', () => {
		it('should start disconnected', () => {
			expect(manager.isConnected()).toBe(false);
		});

		it('should return connection type as null when not connected', () => {
			expect(manager.getConnectionType()).toBeNull();
		});
	});

	describe('sendCommand', () => {
		it('should throw error when not connected', async () => {
			await expect(manager.sendCommand('GET_INFO')).rejects.toThrow('Device not connected');
		});
	});

	describe('event handling', () => {
		it('should allow registering event handlers', () => {
			const handler = jest.fn();
			manager.on(handler);
			expect(handler).not.toHaveBeenCalled();
		});

		it('should allow unregistering event handlers', () => {
			const handler = jest.fn();
			manager.on(handler);
			manager.off(handler);
			// Verify no error occurs
			expect(true).toBe(true);
		});
	});
});
