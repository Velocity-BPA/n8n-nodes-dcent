/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * D'CENT Supported Coins Registry
 * Contains all supported cryptocurrencies and their configurations
 */

export interface CoinConfig {
  coinType: string;
  symbol: string;
  name: string;
  network: string;
  decimals: number;
  derivationPath: string;
  addressType?: string;
  isEvm?: boolean;
  chainId?: number;
  rpcUrl?: string;
  explorerUrl?: string;
}

export const COIN_TYPES = {
  // Bitcoin and variants
  BITCOIN: 'bitcoin',
  BITCOIN_TESTNET: 'bitcoin_testnet',
  BITCOIN_CASH: 'bitcoincash',
  LITECOIN: 'litecoin',
  DASH: 'dash',
  DOGECOIN: 'dogecoin',
  ZCASH: 'zcash',
  HORIZEN: 'horizen',
  RAVENCOIN: 'ravencoin',
  DIGIBYTE: 'digibyte',

  // Ethereum and EVM
  ETHEREUM: 'ethereum',
  ETHEREUM_GOERLI: 'ethereum_goerli',
  ETHEREUM_SEPOLIA: 'ethereum_sepolia',
  BNB_CHAIN: 'bnb_chain',
  POLYGON: 'polygon',
  AVALANCHE: 'avalanche',
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism',
  FANTOM: 'fantom',
  CRONOS: 'cronos',
  GNOSIS: 'gnosis',
  BASE: 'base',
  CUSTOM_EVM: 'custom_evm',

  // Klaytn
  KLAYTN: 'klaytn',
  KLAYTN_TESTNET: 'klaytn_testnet',

  // Other chains
  XRP: 'xrp',
  STELLAR: 'stellar',
  TRON: 'tron',
  COSMOS: 'cosmos',
  POLKADOT: 'polkadot',
  KUSAMA: 'kusama',
  NEAR: 'near',
  SOLANA: 'solana',
  HEDERA: 'hedera',
  ALGORAND: 'algorand',
  TEZOS: 'tezos',
  MONACOIN: 'monacoin',
  HECO: 'heco',
} as const;

export type CoinType = (typeof COIN_TYPES)[keyof typeof COIN_TYPES];

export const SUPPORTED_COINS: Record<CoinType, CoinConfig> = {
  // Bitcoin and variants
  [COIN_TYPES.BITCOIN]: {
    coinType: 'BITCOIN',
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/84'/0'/0'",
    addressType: 'native_segwit',
  },
  [COIN_TYPES.BITCOIN_TESTNET]: {
    coinType: 'BITCOIN_TESTNET',
    symbol: 'tBTC',
    name: 'Bitcoin Testnet',
    network: 'testnet',
    decimals: 8,
    derivationPath: "m/84'/1'/0'",
    addressType: 'native_segwit',
  },
  [COIN_TYPES.BITCOIN_CASH]: {
    coinType: 'BITCOINCASH',
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/145'/0'",
  },
  [COIN_TYPES.LITECOIN]: {
    coinType: 'LITECOIN',
    symbol: 'LTC',
    name: 'Litecoin',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/84'/2'/0'",
    addressType: 'native_segwit',
  },
  [COIN_TYPES.DASH]: {
    coinType: 'DASH',
    symbol: 'DASH',
    name: 'Dash',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/5'/0'",
  },
  [COIN_TYPES.DOGECOIN]: {
    coinType: 'DOGECOIN',
    symbol: 'DOGE',
    name: 'Dogecoin',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/3'/0'",
  },
  [COIN_TYPES.ZCASH]: {
    coinType: 'ZCASH',
    symbol: 'ZEC',
    name: 'Zcash',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/133'/0'",
  },
  [COIN_TYPES.HORIZEN]: {
    coinType: 'HORIZEN',
    symbol: 'ZEN',
    name: 'Horizen',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/121'/0'",
  },
  [COIN_TYPES.RAVENCOIN]: {
    coinType: 'RAVENCOIN',
    symbol: 'RVN',
    name: 'Ravencoin',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/175'/0'",
  },
  [COIN_TYPES.DIGIBYTE]: {
    coinType: 'DIGIBYTE',
    symbol: 'DGB',
    name: 'DigiByte',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/84'/20'/0'",
  },

  // Ethereum and EVM chains
  [COIN_TYPES.ETHEREUM]: {
    coinType: 'ETHEREUM',
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
  },
  [COIN_TYPES.ETHEREUM_GOERLI]: {
    coinType: 'ETHEREUM_GOERLI',
    symbol: 'gETH',
    name: 'Ethereum Goerli',
    network: 'goerli',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/',
    explorerUrl: 'https://goerli.etherscan.io',
  },
  [COIN_TYPES.ETHEREUM_SEPOLIA]: {
    coinType: 'ETHEREUM_SEPOLIA',
    symbol: 'sETH',
    name: 'Ethereum Sepolia',
    network: 'sepolia',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  [COIN_TYPES.BNB_CHAIN]: {
    coinType: 'BNB_CHAIN',
    symbol: 'BNB',
    name: 'BNB Chain',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
  },
  [COIN_TYPES.POLYGON]: {
    coinType: 'POLYGON',
    symbol: 'MATIC',
    name: 'Polygon',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
  },
  [COIN_TYPES.AVALANCHE]: {
    coinType: 'AVALANCHE',
    symbol: 'AVAX',
    name: 'Avalanche C-Chain',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
  },
  [COIN_TYPES.ARBITRUM]: {
    coinType: 'ARBITRUM',
    symbol: 'ETH',
    name: 'Arbitrum One',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
  },
  [COIN_TYPES.OPTIMISM]: {
    coinType: 'OPTIMISM',
    symbol: 'ETH',
    name: 'Optimism',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  [COIN_TYPES.FANTOM]: {
    coinType: 'FANTOM',
    symbol: 'FTM',
    name: 'Fantom Opera',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 250,
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
  },
  [COIN_TYPES.CRONOS]: {
    coinType: 'CRONOS',
    symbol: 'CRO',
    name: 'Cronos',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 25,
    rpcUrl: 'https://evm.cronos.org',
    explorerUrl: 'https://cronoscan.com',
  },
  [COIN_TYPES.GNOSIS]: {
    coinType: 'GNOSIS',
    symbol: 'xDAI',
    name: 'Gnosis Chain',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 100,
    rpcUrl: 'https://rpc.gnosischain.com',
    explorerUrl: 'https://gnosisscan.io',
  },
  [COIN_TYPES.BASE]: {
    coinType: 'BASE',
    symbol: 'ETH',
    name: 'Base',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
  },
  [COIN_TYPES.HECO]: {
    coinType: 'HECO',
    symbol: 'HT',
    name: 'Huobi ECO Chain',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 128,
    rpcUrl: 'https://http-mainnet.hecochain.com',
    explorerUrl: 'https://hecoinfo.com',
  },
  [COIN_TYPES.CUSTOM_EVM]: {
    coinType: 'CUSTOM_EVM',
    symbol: 'ETH',
    name: 'Custom EVM',
    network: 'custom',
    decimals: 18,
    derivationPath: "m/44'/60'/0'/0",
    isEvm: true,
    chainId: 0,
  },

  // Klaytn
  [COIN_TYPES.KLAYTN]: {
    coinType: 'KLAYTN',
    symbol: 'KLAY',
    name: 'Klaytn',
    network: 'mainnet',
    decimals: 18,
    derivationPath: "m/44'/8217'/0'/0",
    isEvm: true,
    chainId: 8217,
    rpcUrl: 'https://public-node-api.klaytnapi.com/v1/cypress',
    explorerUrl: 'https://scope.klaytn.com',
  },
  [COIN_TYPES.KLAYTN_TESTNET]: {
    coinType: 'KLAYTN_TESTNET',
    symbol: 'KLAY',
    name: 'Klaytn Baobab',
    network: 'testnet',
    decimals: 18,
    derivationPath: "m/44'/8217'/0'/0",
    isEvm: true,
    chainId: 1001,
    rpcUrl: 'https://api.baobab.klaytn.net:8651',
    explorerUrl: 'https://baobab.scope.klaytn.com',
  },

  // Other chains
  [COIN_TYPES.XRP]: {
    coinType: 'XRP',
    symbol: 'XRP',
    name: 'XRP',
    network: 'mainnet',
    decimals: 6,
    derivationPath: "m/44'/144'/0'/0",
  },
  [COIN_TYPES.STELLAR]: {
    coinType: 'STELLAR',
    symbol: 'XLM',
    name: 'Stellar',
    network: 'mainnet',
    decimals: 7,
    derivationPath: "m/44'/148'/0'",
  },
  [COIN_TYPES.TRON]: {
    coinType: 'TRON',
    symbol: 'TRX',
    name: 'Tron',
    network: 'mainnet',
    decimals: 6,
    derivationPath: "m/44'/195'/0'/0",
  },
  [COIN_TYPES.COSMOS]: {
    coinType: 'COSMOS',
    symbol: 'ATOM',
    name: 'Cosmos',
    network: 'mainnet',
    decimals: 6,
    derivationPath: "m/44'/118'/0'/0",
  },
  [COIN_TYPES.POLKADOT]: {
    coinType: 'POLKADOT',
    symbol: 'DOT',
    name: 'Polkadot',
    network: 'mainnet',
    decimals: 10,
    derivationPath: "m/44'/354'/0'/0",
  },
  [COIN_TYPES.KUSAMA]: {
    coinType: 'KUSAMA',
    symbol: 'KSM',
    name: 'Kusama',
    network: 'mainnet',
    decimals: 12,
    derivationPath: "m/44'/434'/0'/0",
  },
  [COIN_TYPES.NEAR]: {
    coinType: 'NEAR',
    symbol: 'NEAR',
    name: 'Near',
    network: 'mainnet',
    decimals: 24,
    derivationPath: "m/44'/397'/0'",
  },
  [COIN_TYPES.SOLANA]: {
    coinType: 'SOLANA',
    symbol: 'SOL',
    name: 'Solana',
    network: 'mainnet',
    decimals: 9,
    derivationPath: "m/44'/501'/0'/0'",
  },
  [COIN_TYPES.HEDERA]: {
    coinType: 'HEDERA',
    symbol: 'HBAR',
    name: 'Hedera',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/3030'/0'/0",
  },
  [COIN_TYPES.ALGORAND]: {
    coinType: 'ALGORAND',
    symbol: 'ALGO',
    name: 'Algorand',
    network: 'mainnet',
    decimals: 6,
    derivationPath: "m/44'/283'/0'/0",
  },
  [COIN_TYPES.TEZOS]: {
    coinType: 'TEZOS',
    symbol: 'XTZ',
    name: 'Tezos',
    network: 'mainnet',
    decimals: 6,
    derivationPath: "m/44'/1729'/0'/0'",
  },
  [COIN_TYPES.MONACOIN]: {
    coinType: 'MONACOIN',
    symbol: 'MONA',
    name: 'Monacoin',
    network: 'mainnet',
    decimals: 8,
    derivationPath: "m/44'/22'/0'",
  },
};

export const EVM_CHAINS = Object.entries(SUPPORTED_COINS)
  .filter(([_, config]) => config.isEvm)
  .map(([key]) => key);

export const BITCOIN_LIKE_COINS = [
  COIN_TYPES.BITCOIN,
  COIN_TYPES.BITCOIN_TESTNET,
  COIN_TYPES.BITCOIN_CASH,
  COIN_TYPES.LITECOIN,
  COIN_TYPES.DASH,
  COIN_TYPES.DOGECOIN,
  COIN_TYPES.ZCASH,
  COIN_TYPES.HORIZEN,
  COIN_TYPES.RAVENCOIN,
  COIN_TYPES.DIGIBYTE,
  COIN_TYPES.MONACOIN,
] as const;

export type BitcoinLikeCoin = (typeof BITCOIN_LIKE_COINS)[number];

export function getCoinConfig(coinType: CoinType): CoinConfig | undefined {
  return SUPPORTED_COINS[coinType];
}

export function isEvmChain(coinType: CoinType): boolean {
  const config = getCoinConfig(coinType);
  return config?.isEvm === true;
}

export function isBitcoinLike(coinType: CoinType): coinType is BitcoinLikeCoin {
  return (BITCOIN_LIKE_COINS as readonly string[]).includes(coinType);
}
