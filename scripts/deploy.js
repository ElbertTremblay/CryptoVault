const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting CryptoVault deployment...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy CryptoVault contract
  console.log("\n📦 Deploying CryptoVault...");
  const CryptoVault = await hre.ethers.getContractFactory("CryptoVault");
  const cryptoVault = await CryptoVault.deploy();
  await cryptoVault.waitForDeployment();
  
  const cryptoVaultAddress = await cryptoVault.getAddress();
  console.log("✅ CryptoVault deployed to:", cryptoVaultAddress);

  // Deploy ConfidentialDEX contract
  console.log("\n📦 Deploying ConfidentialDEX...");
  const ConfidentialDEX = await hre.ethers.getContractFactory("ConfidentialDEX");
  const confidentialDEX = await ConfidentialDEX.deploy();
  await confidentialDEX.waitForDeployment();
  
  const dexAddress = await confidentialDEX.getAddress();
  console.log("✅ ConfidentialDEX deployed to:", dexAddress);

  // Deploy FHEOracle contract
  console.log("\n📦 Deploying FHEOracle...");
  const FHEOracle = await hre.ethers.getContractFactory("FHEOracle");
  const fheOracle = await FHEOracle.deploy();
  await fheOracle.waitForDeployment();
  
  const oracleAddress = await fheOracle.getAddress();
  console.log("✅ FHEOracle deployed to:", oracleAddress);

  // Deploy Mock Tokens for testing
  console.log("\n📦 Deploying Mock Tokens...");
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  
  const usdc = await MockToken.deploy("USD Coin", "USDC", 6, 1000000);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ USDC Mock deployed to:", usdcAddress);

  const usdt = await MockToken.deploy("Tether", "USDT", 6, 1000000);
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("✅ USDT Mock deployed to:", usdtAddress);

  // Setup initial configuration
  console.log("\n⚙️  Setting up initial configuration...");
  
  // Add oracle as authorized caller
  await fheOracle.addAuthorizedCaller(cryptoVaultAddress);
  console.log("✅ CryptoVault authorized for FHE Oracle");

  await fheOracle.addAuthorizedCaller(dexAddress);
  console.log("✅ ConfidentialDEX authorized for FHE Oracle");

  // Create trading pairs on DEX
  await confidentialDEX.createTradingPair(usdcAddress, usdtAddress, 25); // 0.25% fee
  console.log("✅ USDC/USDT trading pair created");

  // Set initial prices (for testing)
  const usdcUsdtPairId = await confidentialDEX.getPairId(usdcAddress, usdtAddress);
  await confidentialDEX.updatePairPrice(usdcUsdtPairId, hre.ethers.parseEther("1")); // 1:1
  console.log("✅ Initial prices set");

  // Print deployment summary
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("=====================");
  console.log(`🏦 CryptoVault:      ${cryptoVaultAddress}`);
  console.log(`🔄 ConfidentialDEX:  ${dexAddress}`);
  console.log(`🔮 FHEOracle:        ${oracleAddress}`);
  console.log(`💵 USDC Mock:        ${usdcAddress}`);
  console.log(`💵 USDT Mock:        ${usdtAddress}`);
  console.log(`🌐 Network:          ${hre.network.name}`);
  console.log(`🆔 Chain ID:         ${(await hre.ethers.provider.getNetwork()).chainId}`);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      CryptoVault: cryptoVaultAddress,
      ConfidentialDEX: dexAddress,
      FHEOracle: oracleAddress,
      MockTokens: {
        USDC: usdcAddress,
        USDT: usdtAddress
      }
    },
    fhe: {
      FHEVM_EXECUTOR_CONTRACT: "0x848B0066793BcC60346Da1F49049357399B8D595",
      ACL_CONTRACT: "0x687820221192C5B662b25367F70076A37bc79b6c",
      HCU_LIMIT_CONTRACT: "0x594BB474275918AF9609814E68C61B1587c5F838",
      KMS_VERIFIER_CONTRACT: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
      INPUT_VERIFIER_CONTRACT: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
      DECRYPTION_ORACLE_CONTRACT: "0xa02Cda4Ca3a71D7C46997716F4283aa851C28812",
      DECRYPTION_ADDRESS: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
      INPUT_VERIFICATION_ADDRESS: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
      RELAYER_URL: "https://relayer.testnet.zama.cloud"
    }
  };

  // Write to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify contracts on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${cryptoVaultAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${dexAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${oracleAddress}`);
  }

  console.log("\n✨ Deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });