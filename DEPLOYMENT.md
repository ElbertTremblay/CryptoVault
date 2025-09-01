# 🚀 Deployment Guide

This document provides comprehensive deployment instructions for the CryptoVault platform across different networks.

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Node.js v18+ installed
- [ ] Hardhat configured and tested
- [ ] Test ETH for gas fees
- [ ] Environment variables configured
- [ ] MetaMask wallet ready
- [ ] Etherscan API key (for verification)

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Required environment variables
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🏠 Local Development Deployment

### 1. Start Local Network
```bash
# Terminal 1: Start Hardhat Network
npx hardhat node
```

### 2. Deploy Contracts
```bash
# Terminal 2: Deploy to localhost
npm run deploy-local
# or
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Start Frontend
```bash
# Terminal 3: Start frontend on port 3023
npm run start-3023
# or
cd frontend && PORT=3023 npm start
```

### 4. Configure MetaMask
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

Import test accounts:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f5e76b702b4b0dcb2ab6dcf0ccf6dd6b3fa4d4c5d4b44b5de8f5b
```

## 🧪 Sepolia Testnet Deployment

### 1. Prepare Testnet Account

Get Sepolia ETH from faucets:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

Minimum required: `0.1 ETH` for deployment and testing

### 2. Configure Network
```javascript
// hardhat.config.js - Already configured
sepolia: {
  url: process.env.SEPOLIA_URL,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 11155111,
}
```

### 3. Deploy to Sepolia
```bash
# Deploy all contracts to Sepolia
npm run deploy-sepolia

# Or run directly
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

### 4. Verify Deployment
The deployment script automatically:
- ✅ Deploys all contracts
- ✅ Configures initial settings
- ✅ Verifies contracts on Etherscan
- ✅ Saves deployment info to `sepolia-deployment.json`

### 5. Update Frontend Configuration
```javascript
// frontend/.env.local
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/your_key
REACT_APP_CRYPTO_VAULT_ADDRESS=deployed_address
REACT_APP_CONFIDENTIAL_DEX_ADDRESS=deployed_address
REACT_APP_FHE_ORACLE_ADDRESS=deployed_address
```

## 🌍 Mainnet Deployment (Coming Soon)

### 1. Security Checklist
- [ ] Complete smart contract audit
- [ ] Bug bounty program completed
- [ ] Multi-signature wallet setup
- [ ] Emergency procedures documented
- [ ] Insurance coverage obtained

### 2. Deployment Process
```bash
# Deploy to Ethereum mainnet (when ready)
npm run deploy-mainnet

# Verify deployment
npm run verify --network mainnet
```

## 📊 Post-Deployment Tasks

### 1. Contract Verification
```bash
# Verify contracts on Etherscan
npx hardhat verify --network sepolia DEPLOYED_ADDRESS

# For contracts with constructor arguments
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "Constructor" "Arguments"
```

### 2. Initial Configuration

#### CryptoVault Setup
```javascript
// Set platform fee (2.5%)
await cryptoVault.updatePlatformFee(250);

// Set fee collector
await cryptoVault.updateFeeCollector(FEE_COLLECTOR_ADDRESS);
```

#### ConfidentialDEX Setup
```javascript
// Create initial trading pairs
await dex.createTradingPair(WETH, USDC, 30); // 0.3% fee
await dex.createTradingPair(WETH, USDT, 30);

// Set initial prices
await dex.updatePairPrice(WETH_USDC_PAIR, ethers.parseEther("2000"));
```

#### FHE Oracle Setup
```javascript
// Add authorized callers
await oracle.addAuthorizedCaller(CRYPTO_VAULT_ADDRESS);
await oracle.addAuthorizedCaller(CONFIDENTIAL_DEX_ADDRESS);
```

### 3. Frontend Deployment

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy to Vercel/Netlify
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=build
```

#### Environment Variables for Production
```bash
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/key
REACT_APP_CRYPTO_VAULT_ADDRESS=0x...
REACT_APP_CONFIDENTIAL_DEX_ADDRESS=0x...
REACT_APP_FHE_ORACLE_ADDRESS=0x...
REACT_APP_ENABLE_ANALYTICS=true
```

## 🔧 Deployment Scripts

### deploy.js - Local Development
```javascript
// Deploys to localhost with:
// - All core contracts
// - Mock tokens (USDC, USDT)
// - Initial configuration
// - Test data setup
```

### deploy-sepolia.js - Testnet Deployment
```javascript
// Deploys to Sepolia with:
// - Production-ready contracts
// - Real testnet tokens
// - Etherscan verification
// - Comprehensive logging
```

## 📋 Deployment Verification

### Contract Verification Checklist
- [ ] All contracts deployed successfully
- [ ] Contract addresses saved to JSON files
- [ ] Etherscan verification completed
- [ ] Initial configuration applied
- [ ] Trading pairs created
- [ ] Oracle permissions set
- [ ] Frontend updated with addresses

### Functional Testing
```bash
# Run integration tests
npm run test:integration

# Test frontend functionality
# - Wallet connection
# - Contract interactions
# - FHE operations
# - MetaMask transactions
```

### Security Verification
- [ ] Contract ownership transferred to multi-sig
- [ ] Emergency pause functionality tested
- [ ] Access controls verified
- [ ] Rate limiting implemented
- [ ] Gas limits appropriate

## 🚨 Emergency Procedures

### Circuit Breaker Activation
```javascript
// Emergency pause all operations
await cryptoVault.emergencyPause(PROJECT_ID);
await dex.togglePairStatus(PAIR_ID);
```

### Contract Upgrade Process
1. Deploy new implementation
2. Test on testnet thoroughly
3. Audit new implementation
4. Use proxy upgrade pattern
5. Monitor for 24 hours post-upgrade

### Incident Response
1. **Immediate**: Pause affected contracts
2. **Assessment**: Analyze the issue
3. **Communication**: Notify users via official channels
4. **Resolution**: Deploy fixes if needed
5. **Post-mortem**: Document lessons learned

## 📊 Monitoring & Analytics

### Contract Monitoring
- Transaction volume and frequency
- Gas usage patterns
- Error rates and failure points
- User adoption metrics

### Performance Metrics
- Frontend load times
- Contract interaction success rates
- FHE operation performance
- User experience metrics

### Alerting Setup
```javascript
// Monitor critical functions
- Failed transactions > threshold
- Unusual gas consumption
- Contract pause events
- Oracle failures
```

## 🔄 Upgrade Procedures

### Smart Contract Upgrades
1. **Preparation**
   - Test new contracts extensively
   - Complete security audit
   - Prepare upgrade documentation

2. **Deployment**
   - Deploy new implementations
   - Update proxy contracts
   - Verify upgrade success

3. **Verification**
   - Run comprehensive tests
   - Monitor system health
   - Rollback plan ready

### Frontend Updates
```bash
# Build and deploy
npm run build
npm run deploy

# Verify deployment
curl https://your-domain.com/health
```

## 📚 Additional Resources

### Network Information
| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Hardhat | 31337 | http://localhost:8545 | N/A |
| Sepolia | 11155111 | https://sepolia.infura.io/v3/key | https://sepolia.etherscan.io |
| Mainnet | 1 | https://mainnet.infura.io/v3/key | https://etherscan.io |

### Gas Price Recommendations
- **Development**: Use default Hardhat gas prices
- **Testnet**: 1-5 Gwei (free from faucets)
- **Mainnet**: Check current gas prices on EthGasStation

### Deployment Costs (Estimated)
| Contract | Gas Used | Cost @ 50 Gwei |
|----------|----------|----------------|
| CryptoVault | ~2.5M | ~$25 |
| ConfidentialDEX | ~3.2M | ~$32 |
| FHEOracle | ~1.8M | ~$18 |
| **Total** | **~7.5M** | **~$75** |

---

## ✅ Deployment Success Checklist

### Pre-Launch
- [ ] All contracts deployed and verified
- [ ] Frontend configuration updated
- [ ] Testing completed on all networks
- [ ] Documentation updated
- [ ] Security measures implemented

### Launch Day
- [ ] Final deployment to mainnet
- [ ] Frontend deployed to production
- [ ] Monitoring systems active
- [ ] Support channels ready
- [ ] Announcement prepared

### Post-Launch
- [ ] Monitor system health
- [ ] Track user adoption
- [ ] Collect feedback
- [ ] Plan improvements
- [ ] Document lessons learned

---

*For questions or issues during deployment, please refer to the main [README](./README.md) or open an issue in the repository.*