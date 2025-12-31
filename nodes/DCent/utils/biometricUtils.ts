/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Biometric Authentication Utilities
 * Handles biometric workflow and status management
 */

import { BIOMETRIC_STATUS } from '../constants';
import type { BiometricStatus } from '../constants';

export interface BiometricState {
  status: BiometricStatus;
  enrolledFingerprints: number;
  maxFingerprints: number;
  lastAuthTime?: Date;
  failedAttempts: number;
  lockoutEndTime?: Date;
}

export interface BiometricAuthResult {
  success: boolean;
  status: BiometricStatus;
  message: string;
  timestamp: Date;
}

export interface FingerprintInfo {
  id: number;
  name?: string;
  enrolledAt?: Date;
  lastUsedAt?: Date;
}

/**
 * Default biometric configuration
 */
export const BIOMETRIC_CONFIG = {
  MAX_FINGERPRINTS: 5,
  AUTH_TIMEOUT_MS: 30000,
  LOCKOUT_DURATION_MS: 60000,
  MAX_FAILED_ATTEMPTS: 5,
  ENROLLMENT_TIMEOUT_MS: 60000,
} as const;

/**
 * Create initial biometric state
 */
export function createBiometricState(): BiometricState {
  return {
    status: BIOMETRIC_STATUS.DISABLED,
    enrolledFingerprints: 0,
    maxFingerprints: BIOMETRIC_CONFIG.MAX_FINGERPRINTS,
    failedAttempts: 0,
  };
}

/**
 * Update biometric state after authentication attempt
 */
export function updateBiometricState(
  state: BiometricState,
  success: boolean,
): BiometricState {
  if (success) {
    return {
      ...state,
      status: BIOMETRIC_STATUS.AUTHENTICATED,
      lastAuthTime: new Date(),
      failedAttempts: 0,
      lockoutEndTime: undefined,
    };
  }

  const newFailedAttempts = state.failedAttempts + 1;
  const isLockedOut = newFailedAttempts >= BIOMETRIC_CONFIG.MAX_FAILED_ATTEMPTS;

  return {
    ...state,
    status: BIOMETRIC_STATUS.FAILED,
    failedAttempts: newFailedAttempts,
    lockoutEndTime: isLockedOut
      ? new Date(Date.now() + BIOMETRIC_CONFIG.LOCKOUT_DURATION_MS)
      : undefined,
  };
}

/**
 * Check if biometric is currently locked out
 */
export function isLockedOut(state: BiometricState): boolean {
  if (!state.lockoutEndTime) return false;
  return new Date() < state.lockoutEndTime;
}

/**
 * Get remaining lockout time in milliseconds
 */
export function getRemainingLockoutTime(state: BiometricState): number {
  if (!state.lockoutEndTime) return 0;
  const remaining = state.lockoutEndTime.getTime() - Date.now();
  return Math.max(0, remaining);
}

/**
 * Check if biometric can be used (enabled and not locked out)
 */
export function canUseBiometric(state: BiometricState): boolean {
  return (
    state.status === BIOMETRIC_STATUS.ENABLED &&
    state.enrolledFingerprints > 0 &&
    !isLockedOut(state)
  );
}

/**
 * Check if more fingerprints can be enrolled
 */
export function canEnrollFingerprint(state: BiometricState): boolean {
  return state.enrolledFingerprints < state.maxFingerprints;
}

/**
 * Format biometric status for display
 */
export function formatBiometricStatus(status: BiometricStatus): string {
  const statusMessages: Record<BiometricStatus, string> = {
    [BIOMETRIC_STATUS.ENABLED]: 'Biometric authentication is enabled',
    [BIOMETRIC_STATUS.DISABLED]: 'Biometric authentication is disabled',
    [BIOMETRIC_STATUS.AUTHENTICATING]: 'Waiting for fingerprint...',
    [BIOMETRIC_STATUS.AUTHENTICATED]: 'Authentication successful',
    [BIOMETRIC_STATUS.FAILED]: 'Authentication failed',
    [BIOMETRIC_STATUS.NOT_ENROLLED]: 'No fingerprints enrolled',
  };
  return statusMessages[status] || 'Unknown status';
}

/**
 * Create authentication result object
 */
export function createAuthResult(
  success: boolean,
  status: BiometricStatus,
  message?: string,
): BiometricAuthResult {
  return {
    success,
    status,
    message: message || formatBiometricStatus(status),
    timestamp: new Date(),
  };
}

/**
 * Validate fingerprint name
 */
export function validateFingerprintName(name: string): string[] {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Fingerprint name cannot be empty');
  }

  if (name.length > 32) {
    errors.push('Fingerprint name cannot exceed 32 characters');
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push('Fingerprint name can only contain letters, numbers, spaces, hyphens, and underscores');
  }

  return errors;
}

/**
 * Generate default fingerprint name
 */
export function generateFingerprintName(index: number): string {
  const names = ['Index Finger', 'Middle Finger', 'Ring Finger', 'Thumb', 'Pinky'];
  return index < names.length ? names[index] : `Finger ${index + 1}`;
}

/**
 * Calculate biometric security score
 */
export function calculateSecurityScore(state: BiometricState): number {
  let score = 0;

  // Biometric enabled
  if (state.status === BIOMETRIC_STATUS.ENABLED) {
    score += 40;
  }

  // Number of enrolled fingerprints
  const fingerprintScore = Math.min(30, state.enrolledFingerprints * 10);
  score += fingerprintScore;

  // No failed attempts
  if (state.failedAttempts === 0) {
    score += 20;
  }

  // Recent authentication
  if (state.lastAuthTime) {
    const hoursSinceAuth = (Date.now() - state.lastAuthTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceAuth < 1) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

/**
 * Biometric workflow states for UI guidance
 */
export enum BiometricWorkflowState {
  IDLE = 'idle',
  WAITING_FOR_TOUCH = 'waiting_for_touch',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILURE = 'failure',
  TIMEOUT = 'timeout',
  LOCKOUT = 'lockout',
}

/**
 * Get workflow guidance message
 */
export function getWorkflowGuidance(workflowState: BiometricWorkflowState): string {
  const messages: Record<BiometricWorkflowState, string> = {
    [BiometricWorkflowState.IDLE]: 'Ready for biometric authentication',
    [BiometricWorkflowState.WAITING_FOR_TOUCH]: 'Please touch the fingerprint sensor on your D\'CENT device',
    [BiometricWorkflowState.PROCESSING]: 'Processing fingerprint...',
    [BiometricWorkflowState.SUCCESS]: 'Authentication successful! You may proceed.',
    [BiometricWorkflowState.FAILURE]: 'Fingerprint not recognized. Please try again.',
    [BiometricWorkflowState.TIMEOUT]: 'Authentication timed out. Please try again.',
    [BiometricWorkflowState.LOCKOUT]: 'Too many failed attempts. Please wait before trying again.',
  };
  return messages[workflowState];
}
