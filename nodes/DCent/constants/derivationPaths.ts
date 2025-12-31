/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * BIP-44 Derivation Paths for D'CENT Supported Coins
 * Path format: m / purpose' / coin_type' / account' / change / address_index
 */

export const BIP44_PURPOSE = {
  LEGACY: 44,
  SEGWIT: 49,
  NATIVE_SEGWIT: 84,
  TAPROOT: 86,
} as const;

export const COIN_TYPE_NUMBERS = {
  BITCOIN: 0,
  BITCOIN_TESTNET: 1,
  LITECOIN: 2,
  DOGECOIN: 3,
  DASH: 5,
  DIGIBYTE: 20,
  MONACOIN: 22,
  ETHEREUM: 60,
  HORIZEN: 121,
  ZCASH: 133,
  XRP: 144,
  BITCOIN_CASH: 145,
  STELLAR: 148,
  RAVENCOIN: 175,
  TRON: 195,
  ALGORAND: 283,
  POLKADOT: 354,
  NEAR: 397,
  KUSAMA: 434,
  SOLANA: 501,
  COSMOS: 118,
  TEZOS: 1729,
  HEDERA: 3030,
  KLAYTN: 8217,
} as const;

export interface DerivationPathConfig {
  coinType: string;
  purpose: number;
  coinTypeNum: number;
  defaultPath: string;
  addressTypes?: string[];
  description: string;
}

export const DERIVATION_PATHS: Record<string, DerivationPathConfig> = {
  // Bitcoin
  BITCOIN_LEGACY: {
    coinType: 'BITCOIN',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.BITCOIN,
    defaultPath: "m/44'/0'/0'/0/0",
    addressTypes: ['legacy', 'p2pkh'],
    description: 'Bitcoin Legacy (P2PKH) addresses starting with 1',
  },
  BITCOIN_SEGWIT: {
    coinType: 'BITCOIN',
    purpose: BIP44_PURPOSE.SEGWIT,
    coinTypeNum: COIN_TYPE_NUMBERS.BITCOIN,
    defaultPath: "m/49'/0'/0'/0/0",
    addressTypes: ['segwit', 'p2sh-p2wpkh'],
    description: 'Bitcoin SegWit (P2SH-P2WPKH) addresses starting with 3',
  },
  BITCOIN_NATIVE_SEGWIT: {
    coinType: 'BITCOIN',
    purpose: BIP44_PURPOSE.NATIVE_SEGWIT,
    coinTypeNum: COIN_TYPE_NUMBERS.BITCOIN,
    defaultPath: "m/84'/0'/0'/0/0",
    addressTypes: ['native_segwit', 'bech32', 'p2wpkh'],
    description: 'Bitcoin Native SegWit (P2WPKH) addresses starting with bc1q',
  },
  BITCOIN_TAPROOT: {
    coinType: 'BITCOIN',
    purpose: BIP44_PURPOSE.TAPROOT,
    coinTypeNum: COIN_TYPE_NUMBERS.BITCOIN,
    defaultPath: "m/86'/0'/0'/0/0",
    addressTypes: ['taproot', 'bech32m', 'p2tr'],
    description: 'Bitcoin Taproot (P2TR) addresses starting with bc1p',
  },

  // Ethereum and EVM
  ETHEREUM: {
    coinType: 'ETHEREUM',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.ETHEREUM,
    defaultPath: "m/44'/60'/0'/0/0",
    description: 'Ethereum and EVM-compatible chains',
  },

  // Klaytn
  KLAYTN: {
    coinType: 'KLAYTN',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.KLAYTN,
    defaultPath: "m/44'/8217'/0'/0/0",
    description: 'Klaytn blockchain',
  },

  // Other coins
  LITECOIN: {
    coinType: 'LITECOIN',
    purpose: BIP44_PURPOSE.NATIVE_SEGWIT,
    coinTypeNum: COIN_TYPE_NUMBERS.LITECOIN,
    defaultPath: "m/84'/2'/0'/0/0",
    description: 'Litecoin Native SegWit',
  },
  DOGECOIN: {
    coinType: 'DOGECOIN',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.DOGECOIN,
    defaultPath: "m/44'/3'/0'/0/0",
    description: 'Dogecoin',
  },
  XRP: {
    coinType: 'XRP',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.XRP,
    defaultPath: "m/44'/144'/0'/0/0",
    description: 'XRP Ledger',
  },
  STELLAR: {
    coinType: 'STELLAR',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.STELLAR,
    defaultPath: "m/44'/148'/0'",
    description: 'Stellar Lumens',
  },
  TRON: {
    coinType: 'TRON',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.TRON,
    defaultPath: "m/44'/195'/0'/0/0",
    description: 'Tron Network',
  },
  COSMOS: {
    coinType: 'COSMOS',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.COSMOS,
    defaultPath: "m/44'/118'/0'/0/0",
    description: 'Cosmos Hub',
  },
  POLKADOT: {
    coinType: 'POLKADOT',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.POLKADOT,
    defaultPath: "m/44'/354'/0'/0/0",
    description: 'Polkadot',
  },
  NEAR: {
    coinType: 'NEAR',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.NEAR,
    defaultPath: "m/44'/397'/0'",
    description: 'Near Protocol',
  },
  SOLANA: {
    coinType: 'SOLANA',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.SOLANA,
    defaultPath: "m/44'/501'/0'/0'",
    description: 'Solana',
  },
  ALGORAND: {
    coinType: 'ALGORAND',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.ALGORAND,
    defaultPath: "m/44'/283'/0'/0/0",
    description: 'Algorand',
  },
  HEDERA: {
    coinType: 'HEDERA',
    purpose: BIP44_PURPOSE.LEGACY,
    coinTypeNum: COIN_TYPE_NUMBERS.HEDERA,
    defaultPath: "m/44'/3030'/0'/0/0",
    description: 'Hedera Hashgraph',
  },
};

/**
 * Build a derivation path string
 */
export function buildDerivationPath(
  purpose: number,
  coinType: number,
  account: number = 0,
  change: number = 0,
  addressIndex: number = 0,
  hardened: { account?: boolean; change?: boolean; address?: boolean } = {
    account: true,
    change: false,
    address: false,
  },
): string {
  const accountPath = hardened.account ? `${account}'` : `${account}`;
  const changePath = hardened.change ? `${change}'` : `${change}`;
  const addressPath = hardened.address ? `${addressIndex}'` : `${addressIndex}`;

  return `m/${purpose}'/${coinType}'/${accountPath}/${changePath}/${addressPath}`;
}

/**
 * Parse a derivation path string into components
 */
export function parseDerivationPath(path: string): {
  purpose: number;
  coinType: number;
  account: number;
  change: number;
  addressIndex: number;
} | null {
  const regex = /^m\/(\d+)'\/(\d+)'\/(\d+)'?\/(\d+)'?\/(\d+)'?$/;
  const match = path.match(regex);

  if (!match) {
    return null;
  }

  return {
    purpose: parseInt(match[1], 10),
    coinType: parseInt(match[2], 10),
    account: parseInt(match[3], 10),
    change: parseInt(match[4], 10),
    addressIndex: parseInt(match[5], 10),
  };
}

/**
 * Get the default derivation path for a coin type
 */
export function getDefaultPath(coinType: keyof typeof DERIVATION_PATHS): string {
  return DERIVATION_PATHS[coinType]?.defaultPath ?? "m/44'/60'/0'/0/0";
}
