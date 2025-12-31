# n8n-nodes-dcent

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for D'CENT hardware wallet integration, providing secure cryptocurrency operations including account management, transaction signing, and multi-chain support for Bitcoin, Ethereum, and 15+ blockchain networks.

![n8n Version](https://img.shields.io/badge/n8n-%3E%3D1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Hardware Security**: Direct integration with D'CENT biometric hardware wallet
- **Multi-Chain Support**: Bitcoin, Ethereum, Polygon, Arbitrum, XRP, Stellar, Tron, Cosmos, Polkadot, NEAR, Solana, Hedera, Algorand, and more
- **Connection Options**: USB, Bluetooth, NFC, and Bridge connections
- **Account Management**: Create, manage, and synchronize wallet accounts
- **Transaction Operations**: Build, sign, and broadcast transactions securely
- **Token Support**: ERC-20, ERC-721, ERC-1155 token operations
- **Message Signing**: EIP-191 and EIP-712 typed data signing
- **Biometric Security**: Fingerprint authentication for enhanced security
- **Event Triggers**: Real-time monitoring of device events and transactions

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-dcent` in the search field
5. Agree to the risks and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-dcent
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-dcent.zip
cd n8n-nodes-dcent

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-dcent

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-dcent %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### D'CENT Device Credentials

| Field | Description |
|-------|-------------|
| Connection Type | USB, Bluetooth, NFC, or Bridge |
| Device Label | Optional device identifier |
| PIN | Device PIN (if required) |

### D'CENT Bridge Credentials

| Field | Description |
|-------|-------------|
| Bridge URL | D'CENT Bridge server URL |
| API Key | Bridge API key (optional) |
| Timeout | Connection timeout in milliseconds |

### D'CENT Network Credentials

| Field | Description |
|-------|-------------|
| Network | Mainnet or Testnet |
| RPC URL | Custom RPC endpoint (optional) |
| API Key | Network API key (optional) |

## Resources & Operations

### Device Operations
- **Get Info**: Retrieve device information
- **Get Status**: Check device connection status
- **Initialize**: Initialize device connection
- **Disconnect**: Safely disconnect device

### Account Operations
- **Get Account**: Retrieve account details
- **List Accounts**: List all accounts
- **Create Account**: Create new account
- **Sync Account**: Synchronize account data

### Bitcoin Operations
- **Get Address**: Derive Bitcoin address
- **Get Public Key**: Get public key for path
- **Sign Transaction**: Sign Bitcoin transaction
- **Sign Message**: Sign message with Bitcoin key

### Ethereum Operations
- **Get Address**: Derive Ethereum address
- **Sign Transaction**: Sign Ethereum transaction
- **Sign Message**: Sign personal message
- **Sign Typed Data**: Sign EIP-712 typed data

### EVM Chains Operations
- **Get Address**: Derive address for EVM chain
- **Sign Transaction**: Sign EVM transaction
- **Get Chain Info**: Get chain configuration

### Token Operations
- **Get Balance**: Get token balance
- **Transfer**: Transfer tokens
- **Approve**: Approve token spending

### NFT Operations
- **Get NFTs**: List owned NFTs
- **Transfer**: Transfer NFT
- **Approve**: Approve NFT operations

### Transaction Operations
- **Build**: Build transaction
- **Sign**: Sign transaction
- **Broadcast**: Broadcast signed transaction
- **Get Status**: Check transaction status

### Signing Operations
- **Personal Sign**: Sign personal message
- **Typed Data**: Sign EIP-712 data
- **Raw Sign**: Sign raw hash

### Additional Resources
- **Address**: Address validation and derivation
- **Biometric**: Fingerprint authentication
- **Bluetooth**: Bluetooth connection management
- **NFC**: NFC connection management
- **PIN**: PIN management
- **Security**: Security operations
- **Backup**: Backup and recovery
- **Firmware**: Firmware management
- **Utility**: Utility operations

## Trigger Node

The D'CENT Trigger node monitors device events in real-time:

### Event Types
- **Device Connected**: Triggered when device connects
- **Device Disconnected**: Triggered when device disconnects
- **Transaction Signed**: Triggered when transaction is signed
- **Button Pressed**: Triggered on device button press
- **Error Occurred**: Triggered on device error

### Configuration
| Field | Description |
|-------|-------------|
| Connection Type | USB, Bluetooth, NFC, or Bridge |
| Event Filter | Filter by specific event types |
| Poll Interval | Polling interval in milliseconds |

## Usage Examples

### Get Bitcoin Address

```javascript
// Node configuration
{
  "resource": "bitcoin",
  "operation": "getAddress",
  "path": "m/44'/0'/0'/0/0",
  "showOnDevice": true
}
```

### Sign Ethereum Transaction

```javascript
// Node configuration
{
  "resource": "ethereum",
  "operation": "signTransaction",
  "transaction": {
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
    "value": "1000000000000000000",
    "gasLimit": "21000",
    "gasPrice": "20000000000",
    "nonce": "0"
  }
}
```

### Sign Typed Data (EIP-712)

```javascript
// Node configuration
{
  "resource": "signing",
  "operation": "typedData",
  "typedData": {
    "types": {
      "EIP712Domain": [...],
      "Message": [...]
    },
    "primaryType": "Message",
    "domain": {...},
    "message": {...}
  }
}
```

## Supported Networks

| Network | Coin Type | Mainnet | Testnet |
|---------|-----------|---------|---------|
| Bitcoin | BTC | ✅ | ✅ |
| Ethereum | ETH | ✅ | ✅ |
| Polygon | MATIC | ✅ | ✅ |
| Arbitrum | ARB | ✅ | ✅ |
| XRP Ledger | XRP | ✅ | ✅ |
| Stellar | XLM | ✅ | ✅ |
| Tron | TRX | ✅ | ✅ |
| Cosmos | ATOM | ✅ | ✅ |
| Polkadot | DOT | ✅ | ✅ |
| NEAR | NEAR | ✅ | ✅ |
| Solana | SOL | ✅ | ✅ |
| Hedera | HBAR | ✅ | ✅ |
| Algorand | ALGO | ✅ | ✅ |
| Klaytn | KLAY | ✅ | ✅ |
| Bitcoin Cash | BCH | ✅ | ✅ |
| Litecoin | LTC | ✅ | ✅ |
| Dogecoin | DOGE | ✅ | ✅ |

## Error Handling

The node includes comprehensive error handling:

| Error Code | Description |
|------------|-------------|
| DEVICE_NOT_CONNECTED | No device connection |
| USER_REJECTED | User rejected operation |
| INVALID_PARAMETER | Invalid parameter provided |
| TIMEOUT | Operation timed out |
| COMMUNICATION_ERROR | Communication failure |

### Example Error Handling

```javascript
// Use n8n's built-in error handling
{
  "continueOnFail": true,
  "onError": "continueErrorOutput"
}
```

## Security Best Practices

1. **Never store private keys**: All signing happens on the hardware device
2. **Verify addresses on device**: Always enable `showOnDevice` for address verification
3. **Use testnet first**: Test operations on testnet before mainnet
4. **Secure your PIN**: Never share device PIN
5. **Update firmware**: Keep device firmware up to date
6. **Verify transactions**: Always verify transaction details on device display

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all tests pass and follow the existing code style.

## Support

- **Documentation**: [docs.velobpa.com](https://docs.velobpa.com)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-dcent/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [D'CENT](https://dcentwallet.com/) for the hardware wallet SDK
- [n8n](https://n8n.io/) for the workflow automation platform
- The blockchain and cryptocurrency communities
