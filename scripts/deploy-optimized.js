const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting gas-optimized Sepolia deployment...");

  // Verify we're on Sepolia
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error("This script is only for Sepolia testnet (Chain ID: 11155111)");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.02")) {
    throw new Error("Insufficient ETH balance for deployment. Need at least 0.02 ETH");
  }

  // Get current gas price for optimization
  const feeData = await hre.ethers.provider.getFeeData();
  console.log("⛽ Current gas price:", hre.ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");

  // Deploy CryptoVault with gas optimization
  console.log("\n📦 Deploying CryptoVault (gas optimized)...");
  const CryptoVault = await hre.ethers.getContractFactory("CryptoVault");
  
  // Estimate gas before deployment
  const deployTransaction = await CryptoVault.getDeployTransaction();
  const estimatedGas = await hre.ethers.provider.estimateGas(deployTransaction);
  console.log("⛽ Estimated gas:", estimatedGas.toString());

  const cryptoVault = await CryptoVault.deploy({
    gasLimit: estimatedGas + (estimatedGas / 10n), // Add 10% buffer
    gasPrice: feeData.gasPrice
  });
  
  await cryptoVault.waitForDeployment();
  const cryptoVaultAddress = await cryptoVault.getAddress();
  console.log("✅ CryptoVault deployed to:", cryptoVaultAddress);

  // Get deployment transaction receipt
  const deploymentReceipt = await cryptoVault.deploymentTransaction().wait();
  console.log("⛽ Actual gas used:", deploymentReceipt.gasUsed.toString());
  console.log("💸 Deployment cost:", hre.ethers.formatEther(deploymentReceipt.gasUsed * feeData.gasPrice), "ETH");

  // Wait for confirmations
  console.log("\n⏳ Waiting for 5 block confirmations...");
  await cryptoVault.deploymentTransaction().wait(5);

  // Print deployment summary
  console.log("\n📋 SEPOLIA DEPLOYMENT SUMMARY");
  console.log("=============================");
  console.log(`🏦 CryptoVault:      ${cryptoVaultAddress}`);
  console.log(`🌐 Network:          Sepolia Testnet`);
  console.log(`🆔 Chain ID:         11155111`);
  console.log(`🔗 Explorer:         https://sepolia.etherscan.io/address/${cryptoVaultAddress}`);
  console.log(`⛽ Gas Used:         ${deploymentReceipt.gasUsed.toString()}`);
  console.log(`💸 Cost:            ${hre.ethers.formatEther(deploymentReceipt.gasUsed * feeData.gasPrice)} ETH`);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: "11155111",
    explorerUrl: "https://sepolia.etherscan.io",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    gasUsed: deploymentReceipt.gasUsed.toString(),
    gasPrice: feeData.gasPrice.toString(),
    deploymentCost: hre.ethers.formatEther(deploymentReceipt.gasUsed * feeData.gasPrice),
    contracts: {
      CryptoVault: {
        address: cryptoVaultAddress,
        explorer: `https://sepolia.etherscan.io/address/${cryptoVaultAddress}`
      }
    },
    fhe: {
      FHEVM_EXECUTOR_CONTRACT: "0x848B0066793BcC60346Da1F49049357399B8D595",
      ACL_CONTRACT: "0x687820221192C5B662b25367F70076A37bc79b6c",
      RELAYER_URL: "https://relayer.testnet.zama.cloud"
    }
  };

  require('fs').writeFileSync(
    'sepolia-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to sepolia-deployment.json");

  console.log("\n🎉 Gas-optimized Sepolia deployment completed!");
  console.log("\n📱 Frontend Configuration:");
  console.log("Update your frontend config with:");
  console.log(`CRYPTO_VAULT_ADDRESS = "${cryptoVaultAddress}"`);
  console.log(`CHAIN_ID = 11155111`);
  console.log(`RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });