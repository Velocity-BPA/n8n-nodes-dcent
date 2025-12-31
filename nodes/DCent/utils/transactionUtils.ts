/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Transaction Utilities
 * Handles transaction building, signing, and validation
 */

import { SUPPORTED_COINS, isEvmChain, isBitcoinLike } from '../constants';
import type { CoinType } from '../constants';

export interface TransactionRequest {
  coinType: CoinType;
  from: string;
  to: string;
  amount: string;
  fee?: string;
  memo?: string;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  data?: string;
  chainId?: number;
}

export interface SignedTransaction {
  txHash: string;
  signedTx: string;
  signature: string;
  v?: number;
  r?: string;
  s?: string;
}

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  confirmations: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: Date;
}

export interface FeeEstimate {
  slow: string;
  medium: string;
  fast: string;
  unit: string;
  currency: string;
}

/**
 * Validate transaction request
 */
export function validateTransactionRequest(tx: TransactionRequest): string[] {
  const errors: string[] = [];

  if (!tx.coinType) {
    errors.push('Coin type is required');
  }

  if (!tx.from) {
    errors.push('From address is required');
  }

  if (!tx.to) {
    errors.push('To address is required');
  }

  if (!tx.amount) {
    errors.push('Amount is required');
  } else {
    const amount = parseFloat(tx.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  // EVM-specific validation
  if (isEvmChain(tx.coinType)) {
    if (!tx.chainId) {
      errors.push('Chain ID is required for EVM transactions');
    }
  }

  // Bitcoin-specific validation
  if (isBitcoinLike(tx.coinType)) {
    // Bitcoin transactions require UTXOs (handled separately)
  }

  return errors;
}

/**
 * Convert amount to smallest unit (satoshis, wei, etc.)
 */
export function toSmallestUnit(amount: string, coinType: CoinType): bigint {
  const coinConfig = SUPPORTED_COINS[coinType];
  const decimals = coinConfig?.decimals ?? 18;
  
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  
  return BigInt(whole + paddedFraction);
}

/**
 * Convert from smallest unit to display amount
 */
export function fromSmallestUnit(amount: bigint, coinType: CoinType): string {
  const coinConfig = SUPPORTED_COINS[coinType];
  const decimals = coinConfig?.decimals ?? 18;
  
  const amountStr = amount.toString().padStart(decimals + 1, '0');
  const wholeLen = amountStr.length - decimals;
  const whole = amountStr.slice(0, wholeLen) || '0';
  const fraction = amountStr.slice(wholeLen).replace(/0+$/, '');
  
  return fraction ? `${whole}.${fraction}` : whole;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: string, coinType: CoinType, maxDecimals: number = 8): string {
  const coinConfig = SUPPORTED_COINS[coinType];
  const symbol = coinConfig?.symbol ?? '';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return `0 ${symbol}`;
  
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
  
  return `${formatted} ${symbol}`;
}

/**
 * Calculate transaction fee
 */
export function calculateFee(
  gasLimit: bigint,
  gasPrice: bigint,
  coinType: CoinType,
): string {
  if (!isEvmChain(coinType)) {
    // For non-EVM chains, fee is typically specified directly
    return '0';
  }
  
  const feeWei = gasLimit * gasPrice;
  return fromSmallestUnit(feeWei, coinType);
}

/**
 * Estimate gas for EVM transaction
 */
export function estimateGas(tx: TransactionRequest): bigint {
  // Base gas for transfer
  let gas = BigInt(21000);
  
  // Add gas for data
  if (tx.data) {
    const data = tx.data.startsWith('0x') ? tx.data.slice(2) : tx.data;
    const bytes = data.length / 2;
    // 4 gas for zero bytes, 16 for non-zero
    gas += BigInt(bytes * 16); // Simplified: assume all non-zero
  }
  
  return gas;
}

/**
 * Create EIP-1559 transaction parameters
 */
export function createEip1559Params(
  baseFeePerGas: bigint,
  priorityFee: bigint = BigInt(1500000000), // 1.5 gwei default tip
): { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint } {
  const maxFeePerGas = baseFeePerGas * BigInt(2) + priorityFee;
  
  return {
    maxFeePerGas,
    maxPriorityFeePerGas: priorityFee,
  };
}

/**
 * Build Bitcoin transaction skeleton
 */
export interface BitcoinTxInput {
  txid: string;
  vout: number;
  value: bigint;
  scriptPubKey: string;
}

export interface BitcoinTxOutput {
  address: string;
  value: bigint;
}

export interface BitcoinTxSkeleton {
  version: number;
  inputs: BitcoinTxInput[];
  outputs: BitcoinTxOutput[];
  locktime: number;
}

export function createBitcoinTxSkeleton(
  inputs: BitcoinTxInput[],
  outputs: BitcoinTxOutput[],
): BitcoinTxSkeleton {
  return {
    version: 2,
    inputs,
    outputs,
    locktime: 0,
  };
}

/**
 * Calculate Bitcoin transaction size
 */
export function estimateBitcoinTxSize(
  inputCount: number,
  outputCount: number,
  isSegwit: boolean = true,
): number {
  if (isSegwit) {
    // Native SegWit (P2WPKH)
    const baseSize = 10 + inputCount * 68 + outputCount * 31;
    const witnessSize = inputCount * 107;
    return Math.ceil(baseSize + witnessSize / 4);
  }
  
  // Legacy
  return 10 + inputCount * 148 + outputCount * 34;
}

/**
 * Calculate Bitcoin fee
 */
export function calculateBitcoinFee(
  txSize: number,
  feeRate: number, // sat/vB
): bigint {
  return BigInt(Math.ceil(txSize * feeRate));
}

/**
 * Serialize transaction for signing
 */
export function serializeForSigning(tx: TransactionRequest): string {
  // This would be implemented based on the specific chain's requirements
  // Returns hex-encoded transaction data ready for signing
  return JSON.stringify(tx);
}

/**
 * Verify transaction signature
 */
export function verifySignature(
  _message: string,
  signature: string,
  publicKey: string,
): boolean {
  // Placeholder - actual implementation would use cryptographic verification
  return signature.length > 0 && publicKey.length > 0;
}

/**
 * Get transaction explorer URL
 */
export function getExplorerUrl(txHash: string, coinType: CoinType): string | null {
  const coinConfig = SUPPORTED_COINS[coinType];
  const explorerUrl = coinConfig?.explorerUrl;
  
  if (!explorerUrl) return null;
  
  return `${explorerUrl}/tx/${txHash}`;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string, length: number = 16): string {
  if (!hash) return '';
  if (hash.length <= length) return hash;
  
  const halfLength = Math.floor(length / 2);
  return `${hash.slice(0, halfLength)}...${hash.slice(-halfLength)}`;
}

/**
 * Transaction type enum
 */
export enum TransactionType {
  TRANSFER = 'transfer',
  TOKEN_TRANSFER = 'token_transfer',
  CONTRACT_CALL = 'contract_call',
  TOKEN_APPROVAL = 'token_approval',
  NFT_TRANSFER = 'nft_transfer',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  SWAP = 'swap',
}

/**
 * Detect transaction type from data
 */
export function detectTransactionType(tx: TransactionRequest): TransactionType {
  if (!tx.data || tx.data === '0x') {
    return TransactionType.TRANSFER;
  }
  
  const methodId = tx.data.slice(0, 10).toLowerCase();
  
  // Common ERC-20/721 method signatures
  const methodSignatures: Record<string, TransactionType> = {
    '0xa9059cbb': TransactionType.TOKEN_TRANSFER, // transfer(address,uint256)
    '0x23b872dd': TransactionType.NFT_TRANSFER, // transferFrom(address,address,uint256)
    '0x095ea7b3': TransactionType.TOKEN_APPROVAL, // approve(address,uint256)
    '0x42842e0e': TransactionType.NFT_TRANSFER, // safeTransferFrom(address,address,uint256)
  };
  
  return methodSignatures[methodId] ?? TransactionType.CONTRACT_CALL;
}
