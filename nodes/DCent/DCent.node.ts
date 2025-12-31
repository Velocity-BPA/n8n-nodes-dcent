/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';

import * as device from './actions/device';
import * as biometric from './actions/biometric';
import * as bluetooth from './actions/bluetooth';
import * as nfc from './actions/nfc';
import * as account from './actions/account';
import * as bitcoin from './actions/bitcoin';
import * as bitcoinLike from './actions/bitcoinLike';
import * as ethereum from './actions/ethereum';
import * as evmChains from './actions/evmChains';
import * as klaytn from './actions/klaytn';
import * as xrp from './actions/xrp';
import * as stellar from './actions/stellar';
import * as tron from './actions/tron';
import * as cosmos from './actions/cosmos';
import * as polkadot from './actions/polkadot';
import * as near from './actions/near';
import * as solana from './actions/solana';
import * as hedera from './actions/hedera';
import * as algorand from './actions/algorand';
import * as multiChain from './actions/multiChain';
import * as token from './actions/token';
import * as nft from './actions/nft';
import * as transaction from './actions/transaction';
import * as signing from './actions/signing';
import * as address from './actions/address';
import * as pin from './actions/pin';
import * as security from './actions/security';
import * as backup from './actions/backup';
import * as firmware from './actions/firmware';
import * as dcentApp from './actions/dcentApp';
import * as utility from './actions/utility';

// Log licensing notice once on load
console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);

export class DCent implements INodeType {
  description: INodeTypeDescription = {
    displayName: "D'CENT",
    name: 'dcent',
    icon: 'file:dcent.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Interact with D'CENT hardware wallets for secure blockchain operations",
    defaults: {
      name: "D'CENT",
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'dcentDevice',
        required: true,
      },
      {
        name: 'dcentBridge',
        required: false,
      },
      {
        name: 'dcentNetwork',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Device', value: 'device' },
          { name: 'Biometric', value: 'biometric' },
          { name: 'Bluetooth', value: 'bluetooth' },
          { name: 'NFC', value: 'nfc' },
          { name: 'Account', value: 'account' },
          { name: 'Bitcoin', value: 'bitcoin' },
          { name: 'Bitcoin-Like Coins', value: 'bitcoinLike' },
          { name: 'Ethereum', value: 'ethereum' },
          { name: 'EVM Chains', value: 'evmChains' },
          { name: 'Klaytn', value: 'klaytn' },
          { name: 'XRP', value: 'xrp' },
          { name: 'Stellar', value: 'stellar' },
          { name: 'Tron', value: 'tron' },
          { name: 'Cosmos', value: 'cosmos' },
          { name: 'Polkadot', value: 'polkadot' },
          { name: 'Near', value: 'near' },
          { name: 'Solana', value: 'solana' },
          { name: 'Hedera', value: 'hedera' },
          { name: 'Algorand', value: 'algorand' },
          { name: 'Multi-Chain', value: 'multiChain' },
          { name: 'Token', value: 'token' },
          { name: 'NFT', value: 'nft' },
          { name: 'Transaction', value: 'transaction' },
          { name: 'Signing', value: 'signing' },
          { name: 'Address', value: 'address' },
          { name: 'PIN', value: 'pin' },
          { name: 'Security', value: 'security' },
          { name: 'Backup', value: 'backup' },
          { name: 'Firmware', value: 'firmware' },
          { name: "D'CENT App", value: 'dcentApp' },
          { name: 'Utility', value: 'utility' },
        ],
        default: 'device',
      },
      // Device Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['device'] } },
        options: [
          { name: 'Check Connection', value: 'checkConnection', action: 'Check device connection' },
          { name: 'Connect Device', value: 'connect', action: 'Connect to device' },
          { name: 'Disconnect Device', value: 'disconnect', action: 'Disconnect from device' },
          { name: 'Get Battery Level', value: 'getBatteryLevel', action: 'Get battery level' },
          { name: 'Get Biometric Status', value: 'getBiometricStatus', action: 'Get biometric status' },
          { name: 'Get Bluetooth Status', value: 'getBluetoothStatus', action: 'Get bluetooth status' },
          { name: 'Get Device Info', value: 'getInfo', action: 'Get device information' },
          { name: 'Get Device Label', value: 'getLabel', action: 'Get device label' },
          { name: 'Get Device Model', value: 'getModel', action: 'Get device model' },
          { name: 'Get Device Status', value: 'getStatus', action: 'Get device status' },
          { name: 'Get Firmware Version', value: 'getFirmwareVersion', action: 'Get firmware version' },
          { name: 'Get Serial Number', value: 'getSerialNumber', action: 'Get serial number' },
          { name: 'Set Device Label', value: 'setLabel', action: 'Set device label' },
          { name: 'Verify Device Authenticity', value: 'verifyAuthenticity', action: 'Verify device authenticity' },
        ],
        default: 'getInfo',
      },
      // Biometric Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['biometric'] } },
        options: [
          { name: 'Authenticate with Biometric', value: 'authenticate', action: 'Authenticate with fingerprint' },
          { name: 'Disable Biometric', value: 'disable', action: 'Disable biometric authentication' },
          { name: 'Enable Biometric', value: 'enable', action: 'Enable biometric authentication' },
          { name: 'Get Biometric Settings', value: 'getSettings', action: 'Get biometric settings' },
          { name: 'Get Biometric Status', value: 'getStatus', action: 'Get biometric status' },
          { name: 'Get Enrolled Fingerprints', value: 'getEnrolled', action: 'Get enrolled fingerprints' },
          { name: 'Is Biometric Enabled', value: 'isEnabled', action: 'Check if biometric is enabled' },
        ],
        default: 'getStatus',
      },
      // Bluetooth Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['bluetooth'] } },
        options: [
          { name: 'Connect Bluetooth', value: 'connect', action: 'Connect via bluetooth' },
          { name: 'Disconnect Bluetooth', value: 'disconnect', action: 'Disconnect bluetooth' },
          { name: 'Get Connection Status', value: 'getStatus', action: 'Get bluetooth connection status' },
          { name: 'Get Paired Devices', value: 'getPairedDevices', action: 'Get list of paired devices' },
          { name: 'Get Signal Strength', value: 'getSignalStrength', action: 'Get bluetooth signal strength' },
          { name: 'Pair Device', value: 'pair', action: 'Pair with device' },
          { name: 'Scan for Devices', value: 'scan', action: 'Scan for bluetooth devices' },
          { name: 'Unpair Device', value: 'unpair', action: 'Unpair device' },
        ],
        default: 'scan',
      },
      // NFC Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['nfc'] } },
        options: [
          { name: 'Connect Card', value: 'connect', action: 'Connect to NFC card' },
          { name: 'Disconnect Card', value: 'disconnect', action: 'Disconnect NFC card' },
          { name: 'Get Card Info', value: 'getCardInfo', action: 'Get NFC card information' },
          { name: 'Get NFC Status', value: 'getStatus', action: 'Get NFC status' },
          { name: 'Read Card Data', value: 'readData', action: 'Read data from card' },
          { name: 'Scan for Card', value: 'scan', action: 'Scan for NFC card' },
        ],
        default: 'scan',
      },
      // Account Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['account'] } },
        options: [
          { name: 'Create Account', value: 'create', action: 'Create new account' },
          { name: 'Get Account Address', value: 'getAddress', action: 'Get account address' },
          { name: 'Get Account Balance', value: 'getBalance', action: 'Get account balance' },
          { name: 'Get Account by Coin', value: 'getByCoin', action: 'Get account by coin type' },
          { name: 'Get Account Info', value: 'getInfo', action: 'Get account information' },
          { name: 'Get Accounts', value: 'getAll', action: 'Get all accounts' },
          { name: 'Get Extended Public Key', value: 'getXpub', action: 'Get extended public key' },
          { name: 'Sync Account', value: 'sync', action: 'Sync account with blockchain' },
        ],
        default: 'getAll',
      },
      // Bitcoin Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['bitcoin'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast signed transaction' },
          { name: 'Create Transaction', value: 'createTx', action: 'Create bitcoin transaction' },
          { name: 'Estimate Fee', value: 'estimateFee', action: 'Estimate transaction fee' },
          { name: 'Get Bitcoin Address', value: 'getAddress', action: 'Get bitcoin address' },
          { name: 'Get Bitcoin Addresses (Batch)', value: 'getAddresses', action: 'Get multiple bitcoin addresses' },
          { name: 'Get Legacy Address', value: 'getLegacyAddress', action: 'Get legacy P2PKH address' },
          { name: 'Get Segwit Address', value: 'getSegwitAddress', action: 'Get native segwit address' },
          { name: 'Get UTXO', value: 'getUtxo', action: 'Get unspent transaction outputs' },
          { name: 'Get xPub/yPub/zPub', value: 'getXpub', action: 'Get extended public key' },
          { name: 'Sign Message', value: 'signMessage', action: 'Sign message with bitcoin key' },
          { name: 'Sign PSBT', value: 'signPsbt', action: 'Sign partially signed bitcoin transaction' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign bitcoin transaction' },
          { name: 'Verify Message', value: 'verifyMessage', action: 'Verify signed message' },
        ],
        default: 'getAddress',
      },
      // Bitcoin-Like Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['bitcoinLike'] } },
        options: [
          { name: 'Broadcast', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Address', value: 'getAddress', action: 'Get coin address' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get balance' },
          { name: 'Get xPub', value: 'getXpub', action: 'Get extended public key' },
          { name: 'Sign Message', value: 'signMessage', action: 'Sign message' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign transaction' },
        ],
        default: 'getAddress',
      },
      // Ethereum Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['ethereum'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Estimate Gas', value: 'estimateGas', action: 'Estimate gas for transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get ETH balance' },
          { name: 'Get Ethereum Address', value: 'getAddress', action: 'Get ethereum address' },
          { name: 'Get Nonce', value: 'getNonce', action: 'Get account nonce' },
          { name: 'Get Token Balances', value: 'getTokenBalances', action: 'Get ERC-20 token balances' },
          { name: 'Sign EIP-1559 Transaction', value: 'signEip1559', action: 'Sign EIP-1559 transaction' },
          { name: 'Sign Legacy Transaction', value: 'signLegacy', action: 'Sign legacy transaction' },
          { name: 'Sign Message', value: 'signMessage', action: 'Sign message' },
          { name: 'Sign Personal Message', value: 'signPersonal', action: 'Sign personal message' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign transaction' },
          { name: 'Sign Typed Data (EIP-712)', value: 'signTypedData', action: 'Sign typed data' },
        ],
        default: 'getAddress',
      },
      // EVM Chains Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['evmChains'] } },
        options: [
          { name: 'Broadcast', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Address', value: 'getAddress', action: 'Get address' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get native token balance' },
          { name: 'Sign Message', value: 'signMessage', action: 'Sign message' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign transaction' },
          { name: 'Sign Typed Data', value: 'signTypedData', action: 'Sign EIP-712 typed data' },
        ],
        default: 'getAddress',
      },
      // Klaytn Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['klaytn'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get KLAY balance' },
          { name: 'Get KIP-7 Tokens', value: 'getKip7Tokens', action: 'Get KIP-7 token balances' },
          { name: 'Get Klaytn Address', value: 'getAddress', action: 'Get klaytn address' },
          { name: 'Sign Fee Delegated Transaction', value: 'signFeeDelegated', action: 'Sign fee delegated transaction' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign klaytn transaction' },
        ],
        default: 'getAddress',
      },
      // XRP Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['xrp'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Account Info', value: 'getAccountInfo', action: 'Get XRP account info' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get XRP balance' },
          { name: 'Get XRP Address', value: 'getAddress', action: 'Get XRP address' },
          { name: 'Sign Payment', value: 'signPayment', action: 'Sign XRP payment' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign XRP transaction' },
        ],
        default: 'getAddress',
      },
      // Stellar Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['stellar'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get XLM balance' },
          { name: 'Get Stellar Address', value: 'getAddress', action: 'Get stellar address' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign stellar transaction' },
        ],
        default: 'getAddress',
      },
      // Tron Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['tron'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get TRX balance' },
          { name: 'Get TRC-10 Tokens', value: 'getTrc10Tokens', action: 'Get TRC-10 tokens' },
          { name: 'Get TRC-20 Tokens', value: 'getTrc20Tokens', action: 'Get TRC-20 tokens' },
          { name: 'Get Tron Address', value: 'getAddress', action: 'Get tron address' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign tron transaction' },
        ],
        default: 'getAddress',
      },
      // Cosmos Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['cosmos'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get ATOM balance' },
          { name: 'Get Cosmos Address', value: 'getAddress', action: 'Get cosmos address' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign cosmos transaction' },
        ],
        default: 'getAddress',
      },
      // Polkadot Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['polkadot'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast extrinsic' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get DOT balance' },
          { name: 'Get Polkadot Address', value: 'getAddress', action: 'Get polkadot address' },
          { name: 'Sign Extrinsic', value: 'signExtrinsic', action: 'Sign polkadot extrinsic' },
        ],
        default: 'getAddress',
      },
      // Near Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['near'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get NEAR balance' },
          { name: 'Get Near Address', value: 'getAddress', action: 'Get near address' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign near transaction' },
        ],
        default: 'getAddress',
      },
      // Solana Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['solana'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get SOL balance' },
          { name: 'Get Solana Address', value: 'getAddress', action: 'Get solana address' },
          { name: 'Get Token Accounts', value: 'getTokenAccounts', action: 'Get SPL token accounts' },
          { name: 'Sign Message', value: 'signMessage', action: 'Sign message' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign solana transaction' },
        ],
        default: 'getAddress',
      },
      // Hedera Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['hedera'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get HBAR balance' },
          { name: 'Get Hedera Account', value: 'getAddress', action: 'Get hedera account' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign hedera transaction' },
        ],
        default: 'getAddress',
      },
      // Algorand Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['algorand'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast transaction' },
          { name: 'Get Algorand Address', value: 'getAddress', action: 'Get algorand address' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get ALGO balance' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign algorand transaction' },
        ],
        default: 'getAddress',
      },
      // Multi-Chain Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['multiChain'] } },
        options: [
          { name: 'Get All Addresses', value: 'getAllAddresses', action: 'Get addresses for all chains' },
          { name: 'Get All Balances', value: 'getAllBalances', action: 'Get balances for all chains' },
          { name: 'Get Chain Info', value: 'getChainInfo', action: 'Get information about a chain' },
          { name: 'Get Portfolio Balance', value: 'getPortfolio', action: 'Get total portfolio value' },
          { name: 'Get Supported Chains', value: 'getSupportedChains', action: 'Get list of supported chains' },
          { name: 'Get Transaction History', value: 'getTxHistory', action: 'Get transaction history' },
        ],
        default: 'getSupportedChains',
      },
      // Token Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['token'] } },
        options: [
          { name: 'Add Custom Token', value: 'addCustomToken', action: 'Add custom token' },
          { name: 'Get Allowance', value: 'getAllowance', action: 'Get token allowance' },
          { name: 'Get Supported Tokens', value: 'getSupportedTokens', action: 'Get supported tokens' },
          { name: 'Get Token Balance', value: 'getBalance', action: 'Get token balance' },
          { name: 'Get Token Info', value: 'getInfo', action: 'Get token information' },
          { name: 'Sign Token Approval', value: 'signApproval', action: 'Sign token approval' },
          { name: 'Sign Token Transfer', value: 'signTransfer', action: 'Sign token transfer' },
        ],
        default: 'getBalance',
      },
      // NFT Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['nft'] } },
        options: [
          { name: 'Display NFT', value: 'display', action: 'Display NFT on device' },
          { name: 'Get NFT by ID', value: 'getById', action: 'Get specific NFT' },
          { name: 'Get NFT Collections', value: 'getCollections', action: 'Get NFT collections' },
          { name: 'Get NFT Metadata', value: 'getMetadata', action: 'Get NFT metadata' },
          { name: 'Get NFTs', value: 'getAll', action: 'Get all NFTs' },
          { name: 'Get Supported NFT Standards', value: 'getSupportedStandards', action: 'Get supported NFT standards' },
          { name: 'Sign NFT Transfer', value: 'signTransfer', action: 'Sign NFT transfer' },
        ],
        default: 'getAll',
      },
      // Transaction Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['transaction'] } },
        options: [
          { name: 'Broadcast Transaction', value: 'broadcast', action: 'Broadcast signed transaction' },
          { name: 'Create Transaction', value: 'create', action: 'Create new transaction' },
          { name: 'Estimate Fee', value: 'estimateFee', action: 'Estimate transaction fee' },
          { name: 'Get Transaction Fee', value: 'getFee', action: 'Get transaction fee' },
          { name: 'Get Transaction History', value: 'getHistory', action: 'Get transaction history' },
          { name: 'Get Transaction Status', value: 'getStatus', action: 'Get transaction status' },
          { name: 'Sign Transaction', value: 'sign', action: 'Sign transaction on device' },
          { name: 'Verify Transaction on Device', value: 'verify', action: 'Verify transaction details on device' },
        ],
        default: 'create',
      },
      // Signing Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['signing'] } },
        options: [
          { name: 'Batch Sign', value: 'batchSign', action: 'Sign multiple items' },
          { name: 'Sign Hash', value: 'signHash', action: 'Sign raw hash' },
          { name: 'Sign Message', value: 'signMessage', action: 'Sign arbitrary message' },
          { name: 'Sign Personal Message', value: 'signPersonal', action: 'Sign personal message (eth_sign)' },
          { name: 'Sign PSBT', value: 'signPsbt', action: 'Sign partially signed bitcoin transaction' },
          { name: 'Sign Transaction', value: 'signTx', action: 'Sign transaction' },
          { name: 'Sign Typed Data', value: 'signTypedData', action: 'Sign EIP-712 typed data' },
          { name: 'Verify Signature', value: 'verify', action: 'Verify signature' },
        ],
        default: 'signMessage',
      },
      // Address Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['address'] } },
        options: [
          { name: 'Display Address on Device', value: 'display', action: 'Display address on device screen' },
          { name: 'Get Address', value: 'get', action: 'Get address for coin' },
          { name: 'Get Address at Path', value: 'getAtPath', action: 'Get address at derivation path' },
          { name: 'Get Change Address', value: 'getChange', action: 'Get change address' },
          { name: 'Get Multiple Addresses', value: 'getMultiple', action: 'Get multiple addresses' },
          { name: 'Validate Address', value: 'validate', action: 'Validate address format' },
          { name: 'Verify Address', value: 'verify', action: 'Verify address on device' },
        ],
        default: 'get',
      },
      // PIN Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['pin'] } },
        options: [
          { name: 'Change PIN', value: 'change', action: 'Change device PIN' },
          { name: 'Get PIN Attempts', value: 'getAttempts', action: 'Get remaining PIN attempts' },
          { name: 'Get PIN Status', value: 'getStatus', action: 'Get PIN status' },
          { name: 'Lock Device', value: 'lock', action: 'Lock device' },
          { name: 'Set PIN', value: 'set', action: 'Set device PIN' },
          { name: 'Unlock Device', value: 'unlock', action: 'Unlock device with PIN' },
        ],
        default: 'getStatus',
      },
      // Security Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['security'] } },
        options: [
          { name: 'Factory Reset', value: 'factoryReset', action: 'Factory reset device' },
          { name: 'Get SE Version', value: 'getSeVersion', action: 'Get secure element version' },
          { name: 'Get Security Status', value: 'getStatus', action: 'Get security status' },
          { name: 'Get Tamper Status', value: 'getTamperStatus', action: 'Get tamper detection status' },
          { name: 'Run Diagnostics', value: 'runDiagnostics', action: 'Run device diagnostics' },
          { name: 'Verify Device', value: 'verify', action: 'Verify device authenticity' },
          { name: 'Wipe Device', value: 'wipe', action: 'Wipe all device data' },
        ],
        default: 'getStatus',
      },
      // Backup Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['backup'] } },
        options: [
          { name: 'Check Backup Integrity', value: 'checkIntegrity', action: 'Check backup integrity' },
          { name: 'Get Backup Status', value: 'getStatus', action: 'Get backup status' },
          { name: 'Get Word Count', value: 'getWordCount', action: 'Get recovery word count' },
          { name: 'Verify Recovery Words', value: 'verifyWords', action: 'Verify recovery words' },
        ],
        default: 'getStatus',
      },
      // Firmware Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['firmware'] } },
        options: [
          { name: 'Check for Updates', value: 'checkUpdates', action: 'Check for firmware updates' },
          { name: 'Get Bootloader Version', value: 'getBootloaderVersion', action: 'Get bootloader version' },
          { name: 'Get Device Capabilities', value: 'getCapabilities', action: 'Get device capabilities' },
          { name: 'Get Firmware Version', value: 'getVersion', action: 'Get firmware version' },
          { name: 'Update Firmware', value: 'update', action: 'Update device firmware' },
        ],
        default: 'getVersion',
      },
      // D'CENT App Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['dcentApp'] } },
        options: [
          { name: 'Connect to App', value: 'connect', action: "Connect to D'CENT app" },
          { name: 'Get App Portfolio', value: 'getPortfolio', action: 'Get portfolio from app' },
          { name: 'Get App Settings', value: 'getSettings', action: 'Get app settings' },
          { name: 'Get App Transactions', value: 'getTransactions', action: 'Get transactions from app' },
          { name: 'Sync with App', value: 'sync', action: 'Sync with mobile app' },
        ],
        default: 'connect',
      },
      // Utility Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['utility'] } },
        options: [
          { name: 'Cancel Operation', value: 'cancel', action: 'Cancel current operation' },
          { name: 'Get Coin Info', value: 'getCoinInfo', action: 'Get coin information' },
          { name: 'Get Derivation Paths', value: 'getDerivationPaths', action: 'Get derivation paths' },
          { name: 'Get SDK Version', value: 'getSdkVersion', action: 'Get SDK version' },
          { name: 'Get Supported Coins', value: 'getSupportedCoins', action: 'Get list of supported coins' },
          { name: 'Test Connection', value: 'testConnection', action: 'Test device connection' },
          { name: 'Validate Address', value: 'validateAddress', action: 'Validate blockchain address' },
        ],
        default: 'getSupportedCoins',
      },
      // Common parameters
      {
        displayName: 'Coin',
        name: 'coin',
        type: 'options',
        options: [
          { name: 'Bitcoin (BTC)', value: 'BTC' },
          { name: 'Bitcoin Cash (BCH)', value: 'BCH' },
          { name: 'Litecoin (LTC)', value: 'LTC' },
          { name: 'Dash (DASH)', value: 'DASH' },
          { name: 'Dogecoin (DOGE)', value: 'DOGE' },
          { name: 'Zcash (ZEC)', value: 'ZEC' },
          { name: 'Horizen (ZEN)', value: 'ZEN' },
          { name: 'Ravencoin (RVN)', value: 'RVN' },
          { name: 'DigiByte (DGB)', value: 'DGB' },
        ],
        default: 'BTC',
        displayOptions: {
          show: {
            resource: ['bitcoinLike'],
          },
        },
        description: 'Bitcoin-like coin to use',
      },
      {
        displayName: 'EVM Chain',
        name: 'evmChain',
        type: 'options',
        options: [
          { name: 'Ethereum', value: 'ETH' },
          { name: 'BNB Chain', value: 'BNB' },
          { name: 'Polygon', value: 'MATIC' },
          { name: 'Avalanche C-Chain', value: 'AVAX' },
          { name: 'Arbitrum', value: 'ARB' },
          { name: 'Optimism', value: 'OP' },
          { name: 'Fantom', value: 'FTM' },
          { name: 'Cronos', value: 'CRO' },
          { name: 'Gnosis (xDAI)', value: 'GNO' },
          { name: 'Base', value: 'BASE' },
          { name: 'HECO', value: 'HT' },
        ],
        default: 'ETH',
        displayOptions: {
          show: {
            resource: ['evmChains'],
          },
        },
        description: 'EVM-compatible chain to use',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['getBalance', 'validate', 'verify'],
          },
        },
        description: 'Blockchain address',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['createTx', 'signTx', 'signTransfer', 'signPayment'],
          },
        },
        description: 'Amount to send (in native units)',
      },
      {
        displayName: 'To Address',
        name: 'toAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['createTx', 'signTx', 'signTransfer', 'signPayment'],
          },
        },
        description: 'Recipient address',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['signMessage', 'signPersonal', 'verifyMessage'],
          },
        },
        description: 'Message to sign or verify',
      },
      {
        displayName: 'Derivation Path',
        name: 'derivationPath',
        type: 'string',
        default: "m/44'/0'/0'/0/0",
        displayOptions: {
          show: {
            operation: ['getAtPath', 'getAddress', 'getXpub'],
          },
        },
        description: 'BIP-44 derivation path',
      },
      {
        displayName: 'Account Index',
        name: 'accountIndex',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            operation: ['getAddress', 'getAddresses', 'getBalance', 'create'],
          },
        },
        description: 'Account index (0-based)',
      },
      {
        displayName: 'Device Label',
        name: 'deviceLabel',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['setLabel'],
          },
        },
        description: 'New device label',
      },
      {
        displayName: 'Typed Data',
        name: 'typedData',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            operation: ['signTypedData'],
          },
        },
        description: 'EIP-712 typed data to sign',
      },
      {
        displayName: 'PSBT',
        name: 'psbt',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['signPsbt'],
          },
        },
        description: 'Base64-encoded PSBT',
      },
      {
        displayName: 'Transaction Hex',
        name: 'txHex',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['broadcast', 'sign'],
          },
        },
        description: 'Hex-encoded transaction',
      },
      {
        displayName: 'Token Contract Address',
        name: 'tokenAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['token'],
          },
        },
        description: 'Token contract address',
      },
      {
        displayName: 'NFT Contract Address',
        name: 'nftAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['nft'],
          },
        },
        description: 'NFT contract address',
      },
      {
        displayName: 'Token ID',
        name: 'tokenId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['getById', 'signTransfer', 'getMetadata', 'display'],
            resource: ['nft'],
          },
        },
        description: 'NFT token ID',
      },
      {
        displayName: 'Signature',
        name: 'signature',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['verifyMessage', 'verify'],
          },
        },
        description: 'Signature to verify',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: unknown;

        switch (resource) {
          case 'device':
            result = await device.execute.call(this, operation, i);
            break;
          case 'biometric':
            result = await biometric.execute.call(this, operation, i);
            break;
          case 'bluetooth':
            result = await bluetooth.execute.call(this, operation, i);
            break;
          case 'nfc':
            result = await nfc.execute.call(this, operation, i);
            break;
          case 'account':
            result = await account.execute.call(this, operation, i);
            break;
          case 'bitcoin':
            result = await bitcoin.execute.call(this, operation, i);
            break;
          case 'bitcoinLike':
            result = await bitcoinLike.execute.call(this, operation, i);
            break;
          case 'ethereum':
            result = await ethereum.execute.call(this, operation, i);
            break;
          case 'evmChains':
            result = await evmChains.execute.call(this, operation, i);
            break;
          case 'klaytn':
            result = await klaytn.execute.call(this, operation, i);
            break;
          case 'xrp':
            result = await xrp.execute.call(this, operation, i);
            break;
          case 'stellar':
            result = await stellar.execute.call(this, operation, i);
            break;
          case 'tron':
            result = await tron.execute.call(this, operation, i);
            break;
          case 'cosmos':
            result = await cosmos.execute.call(this, operation, i);
            break;
          case 'polkadot':
            result = await polkadot.execute.call(this, operation, i);
            break;
          case 'near':
            result = await near.execute.call(this, operation, i);
            break;
          case 'solana':
            result = await solana.execute.call(this, operation, i);
            break;
          case 'hedera':
            result = await hedera.execute.call(this, operation, i);
            break;
          case 'algorand':
            result = await algorand.execute.call(this, operation, i);
            break;
          case 'multiChain':
            result = await multiChain.execute.call(this, operation, i);
            break;
          case 'token':
            result = await token.execute.call(this, operation, i);
            break;
          case 'nft':
            result = await nft.execute.call(this, operation, i);
            break;
          case 'transaction':
            result = await transaction.execute.call(this, operation, i);
            break;
          case 'signing':
            result = await signing.execute.call(this, operation, i);
            break;
          case 'address':
            result = await address.execute.call(this, operation, i);
            break;
          case 'pin':
            result = await pin.execute.call(this, operation, i);
            break;
          case 'security':
            result = await security.execute.call(this, operation, i);
            break;
          case 'backup':
            result = await backup.execute.call(this, operation, i);
            break;
          case 'firmware':
            result = await firmware.execute.call(this, operation, i);
            break;
          case 'dcentApp':
            result = await dcentApp.execute.call(this, operation, i);
            break;
          case 'utility':
            result = await utility.execute.call(this, operation, i);
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        returnData.push({
          json: result as IDataObject,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
