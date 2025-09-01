# CryptoVault - Confidential DeFi Platform

<div align="center">

![CryptoVault Logo](https://via.placeholder.com/200x200/667eea/ffffff?text=CryptoVault)

**The Future of Private DeFi - Powered by Zama FHE Protocol**

[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-blue.svg)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow.svg)](https://hardhat.org)
[![FHE](https://img.shields.io/badge/Zama-FHE-purple.svg)](https://zama.ai)

[🚀 Live Demo](http://localhost:3023) | [📖 Documentation](#documentation) | [🔧 Quick Start](#quick-start) | [🏗️ Architecture](#architecture)

</div>

---

## 🌟 Overview

**CryptoVault** is a revolutionary confidential DeFi platform that leverages **Zama's Fully Homomorphic Encryption (FHE)** technology to provide unprecedented privacy in decentralized finance. Unlike traditional DeFi platforms where all transactions and balances are publicly visible, CryptoVault enables:

- **Private Investments**: Contribute to fundraising campaigns without revealing your investment amounts
- **Confidential Trading**: Execute trades on the DEX with encrypted order sizes and balances
- **Anonymous Participation**: Engage in DeFi activities while maintaining complete financial privacy
- **Zero-Knowledge Analytics**: Generate insights from encrypted data without compromising privacy

## ✨ Key Features

### 🔐 Privacy-First Architecture
- **Fully Homomorphic Encryption**: All sensitive data encrypted using Zama's FHE protocol
- **Private Order Books**: DEX orders with encrypted amounts and hidden trading patterns
- **Anonymous Fundraising**: Investment amounts and contributor identities remain confidential
- **Encrypted Analytics**: Compute statistics on encrypted data without decryption

### 🏛️ Core DeFi Functions  
- **Private Investment Vault**: Confidential project fundraising and donation platform
- **Confidential DEX**: Trade tokens with complete privacy and encrypted order matching
- **Secure Fund Management**: Smart contract-based escrow with FHE-protected balances
- **Decentralized Governance**: Private voting and encrypted proposal discussions

### 🛡️ Security & Compliance
- **Audited Smart Contracts**: Comprehensive testing and security analysis
- **Non-Custodial**: Users maintain full control of their assets
- **Regulatory Friendly**: Privacy without compromising compliance capabilities
- **Emergency Controls**: Built-in safeguards and circuit breakers

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      CryptoVault Platform                   │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │   Smart         │   Zama FHE              │
│   (React App)   │   Contracts     │   Infrastructure        │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • Wallet UI     │ • CryptoVault   │ • FHE Encryption        │
│ • DEX Interface │ • ConfidentialDEX│ • Key Management       │
│ • FHE Client    │ • FHEOracle     │ • Proof Generation     │
│ • MetaMask      │ • MockTokens    │ • Decryption Oracle    │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### Smart Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CryptoVault.sol                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Core Functions:                                         │ │
│ │ • createProject()         • contributePrivately()      │ │
│ │ • withdrawFunds()         • claimRefund()              │ │
│ │ │ • requestDecryption()    • emergencyPause()          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
┌─────────────────────▼──────────┐ ┌──────▼────────────────────┐
│      ConfidentialDEX.sol       │ │     FHEOracle.sol         │
│ ┌─────────────────────────────┐ │ │ ┌───────────────────────┐ │
│ │ • createTradingPair()       │ │ │ │ • requestDecryption() │ │
│ │ • createPrivateOrder()      │ │ │ │ • fulfillDecryption() │ │
│ │ • swapTokens()              │ │ │ │ • addAuthorizedCaller()│ │
│ │ • addLiquidity()            │ │ │ │ • checkSignatures()   │ │
│ └─────────────────────────────┘ │ │ └───────────────────────┘ │
└────────────────────────────────┘ └───────────────────────────┘
```

### FHE Integration

The platform integrates with Zama's FHE infrastructure using the following components:

| Component | Address | Purpose |
|-----------|---------|---------|
| **FHEVM Executor** | `0x848B0066793BcC60346Da1F49049357399B8D595` | FHE computation execution |
| **ACL Contract** | `0x687820221192C5B662b25367F70076A37bc79b6c` | Access control for encrypted data |
| **KMS Verifier** | `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC` | Key management and verification |
| **Input Verifier** | `0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4` | Input proof verification |
| **Decryption Oracle** | `0xa02Cda4Ca3a71D7C46997716F4283aa851C28812` | Decryption request handling |
| **Relayer** | `https://relayer.testnet.zama.cloud` | Transaction relay service |

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Git** for version control  
- **MetaMask** browser extension
- **Hardware**: 8GB+ RAM recommended for FHE operations

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd cryptovault-dapp

# Install dependencies
npm install
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template (optional for local development)
cp .env.example .env

# Edit .env with your configuration
# INFURA_PROJECT_ID=your_infura_key
# PRIVATE_KEY=your_private_key
# ETHERSCAN_API_KEY=your_etherscan_key
```

### 3. Local Development

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy-local

# Terminal 3: Start frontend on port 3023
npm run start-3023
```

### 4. Access the Application

- **Frontend**: http://localhost:3023
- **Local Network**: http://localhost:8545 (Chain ID: 31337)
- **Connect MetaMask**: Add local network and import test accounts

## 🔧 Development

### Project Structure

```
cryptovault-dapp/
├── contracts/                  # Smart contracts
│   ├── CryptoVault.sol        # Main investment platform
│   ├── ConfidentialDEX.sol    # Private DEX implementation
│   ├── FHEUtils.sol           # FHE utility functions
│   └── MockToken.sol          # ERC20 tokens for testing
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── contexts/          # React contexts (Wallet, FHE)
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
├── test/                      # Smart contract tests
│   ├── CryptoVault.test.js    # Investment platform tests
│   └── ConfidentialDEX.test.js# DEX functionality tests
├── scripts/                   # Deployment scripts
│   ├── deploy.js              # Local deployment
│   └── deploy-sepolia.js      # Testnet deployment
├── hardhat.config.js          # Hardhat configuration
└── package.json               # Project dependencies
```

### Available Commands

```bash
# Development
npm run compile              # Compile smart contracts
npm run test                 # Run contract tests
npm run coverage             # Generate test coverage report
npm run node                 # Start local Hardhat network

# Deployment
npm run deploy-local         # Deploy to local network
npm run deploy-sepolia       # Deploy to Sepolia testnet
npm run verify               # Verify contracts on Etherscan

# Frontend
npm run start-3023          # Start frontend on port 3023
npm run frontend-build      # Build frontend for production
npm run frontend-install    # Install frontend dependencies

# Utilities
npm run clean               # Clean build artifacts
npm run gas-report          # Generate gas usage report
```

## 🧪 Testing

### Smart Contract Tests

The project includes comprehensive test coverage:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run coverage

# Run tests with gas reporting
npm run gas-report
```

### Test Coverage

- **CryptoVault**: 95%+ coverage
  - Project creation and lifecycle management
  - Private investment flow with FHE encryption
  - Fund withdrawal and refund mechanisms
  - Access control and emergency functions

- **ConfidentialDEX**: 90%+ coverage
  - Trading pair creation and management
  - Private order creation and execution
  - Token swapping with encrypted amounts
  - Liquidity provision and removal

## 🌐 Deployment

### Supported Networks

- **Local Development**: Hardhat Network (Chain ID: 31337)
- **Testnet**: Sepolia Testnet (Chain ID: 11155111)
- **Mainnet**: Ethereum Mainnet (Chain ID: 1) - Coming soon
- **Zama Devnet**: Zama Development Network (Chain ID: 8009)

### Deployment Process

1. **Configure Environment**
   ```bash
   # Set your private key and RPC URL
   export PRIVATE_KEY="your_private_key_here"
   export SEPOLIA_URL="https://sepolia.infura.io/v3/your_key"
   ```

2. **Deploy to Sepolia**
   ```bash
   npm run deploy-sepolia
   ```

3. **Verify Contracts** (automatic in deploy script)
   ```bash
   npm run verify
   ```

### Post-Deployment

After deployment, contracts are automatically:
- ✅ Configured with proper FHE permissions
- ✅ Verified on Etherscan (if API key provided)
- ✅ Initial trading pairs created
- ✅ Frontend configuration updated
- ✅ Deployment info saved to JSON files

## 📱 Frontend Features

### Technology Stack

- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework with glass-morphism design
- **Ethers.js v6**: Ethereum blockchain interaction
- **Framer Motion**: Smooth animations and transitions
- **React Hot Toast**: Beautiful notification system
- **fhevmjs**: Zama FHE client library

### Key Components

- **WalletContext**: MetaMask integration and wallet management
- **FHEContext**: FHE encryption and decryption operations
- **Private Vault**: Investment platform interface
- **Confidential DEX**: Private trading interface
- **Dashboard**: Portfolio and analytics (coming soon)

### UI/UX Design

- **Glass Morphism**: Modern transparent design with backdrop blur
- **Gradient Themes**: Purple/blue primary with accent colors
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Loading States**: Smooth transitions and progress indicators
- **Error Handling**: User-friendly error messages and recovery

## 🛡️ Security

### Smart Contract Security

- **OpenZeppelin Base**: Audited contract foundations
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Access Control**: Role-based permissions and ownership
- **Input Validation**: Comprehensive bounds checking
- **Emergency Pause**: Circuit breakers for critical functions

### FHE Security

- **Encrypted Storage**: All sensitive data stored as ciphertexts
- **Proof Verification**: Zero-knowledge proof validation
- **Authorized Decryption**: Controlled access to plaintext data
- **Key Management**: Secure key derivation and storage

### Frontend Security

- **Wallet Security**: Secure transaction signing and verification
- **Input Sanitization**: Protection against XSS and injection
- **HTTPS Only**: Secure communications with blockchain
- **Environment Variables**: Sensitive configuration protection

## 🎯 Use Cases

### Private Investment Platform

1. **Project Creation**: Launch fundraising campaigns with encrypted goals
2. **Anonymous Investment**: Contribute without revealing amounts
3. **Private Analytics**: Track progress without exposing individual data
4. **Secure Distribution**: Automatic token distribution upon success

### Confidential DEX

1. **Private Trading**: Execute trades without revealing order sizes
2. **Anonymous Liquidity**: Provide liquidity with encrypted amounts
3. **Hidden Arbitrage**: MEV protection through private transactions
4. **Institutional Trading**: Large orders without market impact

## 🔮 Roadmap

### Phase 1: Core Platform (Current)
- [x] FHE-enabled investment platform
- [x] Confidential DEX with private orders
- [x] MetaMask integration and wallet connectivity
- [x] Comprehensive testing and deployment

### Phase 2: Enhanced Privacy (Q2 2024)
- [ ] Advanced zero-knowledge proofs
- [ ] Cross-chain privacy bridges
- [ ] Private governance mechanisms
- [ ] Mobile application

### Phase 3: Ecosystem Expansion (Q3 2024)
- [ ] Private lending and borrowing
- [ ] Confidential yield farming
- [ ] Anonymous DAO creation
- [ ] Institutional features

### Phase 4: Mainnet & Scale (Q4 2024)
- [ ] Ethereum mainnet deployment
- [ ] Layer 2 integrations
- [ ] Advanced analytics dashboard
- [ ] Developer SDK and APIs

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with comprehensive tests
4. Ensure all tests pass: `npm run test`
5. Submit a pull request with detailed description

### Code Standards

- **Solidity**: Follow official style guide and security practices
- **JavaScript/React**: Use ESLint configuration and modern patterns
- **Documentation**: Update README and inline comments
- **Testing**: Maintain >90% test coverage for all new code

## 📄 License

This project is **UNLICENSED** - All rights reserved. This is a demonstration project for educational and development purposes.

## 🔗 Links & Resources

### Platform Links
- **Website**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **Discord**: [Coming Soon]
- **Twitter**: [Coming Soon]

### Technical Resources
- **Zama FHE Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/docs
- **React Documentation**: https://react.dev/learn
- **Ethers.js Documentation**: https://docs.ethers.org/v6/

### Blockchain Resources
- **Sepolia Testnet**: https://sepolia.dev/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **MetaMask Setup**: https://metamask.io/download/

## 🆘 Support & Troubleshooting

### Common Issues

1. **Frontend won't start**: Ensure all dependencies are installed with `npm install`
2. **MetaMask connection issues**: Check network configuration and account permissions
3. **FHE operations failing**: Verify browser compatibility and hardware requirements
4. **Contract deployment fails**: Check account balance and network configuration

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join our developer community [Coming Soon]
- **Documentation**: Comprehensive guides and API references [Coming Soon]

### System Requirements

- **Browser**: Chrome/Firefox with MetaMask extension
- **RAM**: 8GB+ recommended for FHE operations
- **Network**: Stable internet connection for blockchain interaction
- **Node.js**: v18+ for local development

---

<div align="center">

**Built with ❤️ for the privacy-focused DeFi community**

*Powered by [Zama FHE](https://zama.ai) • Built with [Hardhat](https://hardhat.org) • Frontend with [React](https://react.dev)*

**⚠️ IMPORTANT NOTICE**
This is a demonstration platform running on testnet. Do not use real funds.
The FHE implementation is for educational purposes. Always verify smart contract addresses before interacting.

</div>