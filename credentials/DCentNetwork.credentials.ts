/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DCentNetwork implements ICredentialType {
  name = 'dcentNetwork';
  displayName = "D'CENT Network";
  documentationUrl = 'https://dcentwallet.com/support/networks';
  properties: INodeProperties[] = [
    {
      displayName: 'Blockchain',
      name: 'blockchain',
      type: 'options',
      options: [
        { name: 'Bitcoin', value: 'bitcoin' },
        { name: 'Ethereum', value: 'ethereum' },
        { name: 'BNB Chain', value: 'bnb' },
        { name: 'Polygon', value: 'polygon' },
        { name: 'Avalanche C-Chain', value: 'avalanche' },
        { name: 'Arbitrum', value: 'arbitrum' },
        { name: 'Optimism', value: 'optimism' },
        { name: 'Fantom', value: 'fantom' },
        { name: 'Klaytn', value: 'klaytn' },
        { name: 'XRP Ledger', value: 'xrp' },
        { name: 'Stellar', value: 'stellar' },
        { name: 'Tron', value: 'tron' },
        { name: 'Cosmos', value: 'cosmos' },
        { name: 'Polkadot', value: 'polkadot' },
        { name: 'Near', value: 'near' },
        { name: 'Solana', value: 'solana' },
        { name: 'Hedera', value: 'hedera' },
        { name: 'Algorand', value: 'algorand' },
        { name: 'Custom EVM', value: 'customEvm' },
      ],
      default: 'ethereum',
      description: 'Blockchain network to use',
    },
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        { name: 'Mainnet', value: 'mainnet' },
        { name: 'Testnet', value: 'testnet' },
      ],
      default: 'mainnet',
      description: 'Network environment',
    },
    {
      displayName: 'RPC Endpoint URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      description: 'Custom RPC endpoint URL (leave empty for default)',
    },
    {
      displayName: 'Block Explorer URL',
      name: 'explorerUrl',
      type: 'string',
      default: '',
      placeholder: 'https://etherscan.io',
      description: 'Block explorer URL for transaction verification',
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1,
      description: 'Chain ID for EVM-compatible networks',
      displayOptions: {
        show: {
          blockchain: [
            'ethereum',
            'bnb',
            'polygon',
            'avalanche',
            'arbitrum',
            'optimism',
            'fantom',
            'klaytn',
            'customEvm',
          ],
        },
      },
    },
    {
      displayName: 'Custom Network Name',
      name: 'customNetworkName',
      type: 'string',
      default: '',
      placeholder: 'My Custom Network',
      description: 'Name for custom EVM network',
      displayOptions: {
        show: {
          blockchain: ['customEvm'],
        },
      },
    },
    {
      displayName: 'Native Token Symbol',
      name: 'nativeTokenSymbol',
      type: 'string',
      default: 'ETH',
      description: 'Symbol of the native token',
      displayOptions: {
        show: {
          blockchain: ['customEvm'],
        },
      },
    },
    {
      displayName: 'Native Token Decimals',
      name: 'nativeTokenDecimals',
      type: 'number',
      default: 18,
      description: 'Decimal places for native token',
      displayOptions: {
        show: {
          blockchain: ['customEvm'],
        },
      },
    },
  ];
}
