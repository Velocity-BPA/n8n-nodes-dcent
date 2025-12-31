/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Address Utilities
 * Handles address validation, formatting, and derivation
 */

import { SUPPORTED_COINS, COIN_TYPES, isEvmChain, isBitcoinLike } from '../constants';
import type { CoinType } from '../constants';

export interface AddressInfo {
  address: string;
  coinType: CoinType;
  derivationPath: string;
  format?: string;
  isValid: boolean;
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedAddress?: string;
}

/**
 * Address format patterns
 */
const ADDRESS_PATTERNS: Record<string, RegExp> = {
  // Bitcoin addresses
  BITCOIN_LEGACY: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  BITCOIN_SEGWIT: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  BITCOIN_BECH32: /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,62}$/i,
  BITCOIN_BECH32M: /^bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,62}$/i,
  BITCOIN_TESTNET: /^[2mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  BITCOIN_TESTNET_BECH32: /^tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,62}$/i,

  // Ethereum/EVM
  ETHEREUM: /^0x[a-fA-F0-9]{40}$/,

  // Other chains
  LITECOIN_LEGACY: /^[LM][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  LITECOIN_BECH32: /^ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,62}$/i,
  DOGECOIN: /^D[a-km-zA-HJ-NP-Z1-9]{24,34}$/,
  DASH: /^X[a-km-zA-HJ-NP-Z1-9]{24,34}$/,
  XRP: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  STELLAR: /^G[A-Z2-7]{55}$/,
  TRON: /^T[a-zA-Z1-9]{33}$/,
  COSMOS: /^cosmos1[a-z0-9]{38}$/,
  POLKADOT: /^1[a-zA-Z0-9]{46,47}$/,
  NEAR: /^[a-z0-9_-]{2,64}(\.near)?$/,
  SOLANA: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  HEDERA: /^0\.0\.[0-9]+$/,
  ALGORAND: /^[A-Z2-7]{58}$/,
  KLAYTN: /^0x[a-fA-F0-9]{40}$/,
};

/**
 * Validate address format for a specific coin type
 */
export function validateAddress(address: string, coinType: CoinType): AddressValidationResult {
  const errors: string[] = [];

  if (!address) {
    return { isValid: false, errors: ['Address is required'] };
  }

  const trimmedAddress = address.trim();

  // EVM chains use Ethereum format
  if (isEvmChain(coinType) || coinType === COIN_TYPES.KLAYTN) {
    if (!ADDRESS_PATTERNS.ETHEREUM.test(trimmedAddress)) {
      errors.push('Invalid Ethereum/EVM address format');
    }
    return {
      isValid: errors.length === 0,
      errors,
      normalizedAddress: trimmedAddress.toLowerCase(),
    };
  }

  // Bitcoin and variants
  if (isBitcoinLike(coinType)) {
    const isValidBitcoin =
      ADDRESS_PATTERNS.BITCOIN_LEGACY.test(trimmedAddress) ||
      ADDRESS_PATTERNS.BITCOIN_SEGWIT.test(trimmedAddress) ||
      ADDRESS_PATTERNS.BITCOIN_BECH32.test(trimmedAddress) ||
      ADDRESS_PATTERNS.BITCOIN_BECH32M.test(trimmedAddress) ||
      ADDRESS_PATTERNS.BITCOIN_TESTNET.test(trimmedAddress) ||
      ADDRESS_PATTERNS.BITCOIN_TESTNET_BECH32.test(trimmedAddress);

    if (!isValidBitcoin) {
      errors.push('Invalid Bitcoin address format');
    }
    return { isValid: errors.length === 0, errors, normalizedAddress: trimmedAddress };
  }

  // Specific coin validation
  const patternKey = coinType.toUpperCase();
  if (ADDRESS_PATTERNS[patternKey]) {
    if (!ADDRESS_PATTERNS[patternKey].test(trimmedAddress)) {
      errors.push(`Invalid ${coinType} address format`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedAddress: trimmedAddress,
  };
}

/**
 * Format address for display (truncate middle)
 */
export function formatAddress(address: string, prefixLength: number = 8, suffixLength: number = 6): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength + 3) return address;

  const prefix = address.slice(0, prefixLength);
  const suffix = address.slice(-suffixLength);
  return `${prefix}...${suffix}`;
}

/**
 * Get address prefix for a coin type
 */
export function getAddressPrefix(coinType: CoinType): string | null {
  const prefixes: Partial<Record<CoinType, string>> = {
    [COIN_TYPES.BITCOIN]: 'bc1',
    [COIN_TYPES.ETHEREUM]: '0x',
    [COIN_TYPES.LITECOIN]: 'ltc1',
    [COIN_TYPES.XRP]: 'r',
    [COIN_TYPES.STELLAR]: 'G',
    [COIN_TYPES.TRON]: 'T',
    [COIN_TYPES.COSMOS]: 'cosmos1',
    [COIN_TYPES.SOLANA]: '',
    [COIN_TYPES.KLAYTN]: '0x',
  };

  return prefixes[coinType] ?? null;
}

/**
 * Check if address is a contract (EVM only)
 */
export function isContractAddress(address: string): boolean {
  // This is a placeholder - actual implementation would check on-chain
  // Contract addresses typically don't have special patterns
  return ADDRESS_PATTERNS.ETHEREUM.test(address);
}

/**
 * Convert address to checksum format (EVM)
 */
export function toChecksumAddress(address: string): string {
  if (!ADDRESS_PATTERNS.ETHEREUM.test(address)) {
    throw new Error('Invalid Ethereum address');
  }

  // Simplified checksum - in production, use ethers.js or similar
  const lowerAddress = address.toLowerCase().replace('0x', '');
  
  // For proper checksum, you would hash the address and use the hash
  // to determine capitalization. This is a simplified version.
  return '0x' + lowerAddress;
}

/**
 * Validate derivation path format
 */
export function validateDerivationPath(path: string): boolean {
  const pathRegex = /^m(\/\d+'?)+$/;
  return pathRegex.test(path);
}

/**
 * Parse derivation path to components
 */
export function parseDerivationPath(path: string): number[] | null {
  if (!validateDerivationPath(path)) return null;

  const parts = path.slice(2).split('/');
  return parts.map((part) => {
    const isHardened = part.endsWith("'");
    const index = parseInt(part.replace("'", ''), 10);
    return isHardened ? index + 0x80000000 : index;
  });
}

/**
 * Build derivation path string
 */
export function buildDerivationPath(indices: number[], hardened: boolean[] = []): string {
  const parts = indices.map((index, i) => {
    const isHardened = hardened[i] ?? (i < 3);
    const actualIndex = index >= 0x80000000 ? index - 0x80000000 : index;
    return isHardened ? `${actualIndex}'` : `${actualIndex}`;
  });

  return 'm/' + parts.join('/');
}

/**
 * Get default address type for a coin
 */
export function getDefaultAddressType(coinType: CoinType): string {
  const coinConfig = SUPPORTED_COINS[coinType];
  return coinConfig?.addressType ?? 'default';
}

/**
 * Create address info object
 */
export function createAddressInfo(
  address: string,
  coinType: CoinType,
  derivationPath: string,
): AddressInfo {
  const validation = validateAddress(address, coinType);

  return {
    address: validation.normalizedAddress ?? address,
    coinType,
    derivationPath,
    format: getDefaultAddressType(coinType),
    isValid: validation.isValid,
  };
}

/**
 * Compare two addresses (case-insensitive for EVM)
 */
export function compareAddresses(address1: string, address2: string, coinType: CoinType): boolean {
  if (!address1 || !address2) return false;

  if (isEvmChain(coinType)) {
    return address1.toLowerCase() === address2.toLowerCase();
  }

  return address1 === address2;
}
