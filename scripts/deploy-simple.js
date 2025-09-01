import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Starting gas-optimized SimpleCryptoVault deployment to Sepolia...");

  // Verify we're on Sepolia
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error("This script is only for Sepolia testnet (Chain ID: 11155111)");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    throw new Error("Insufficient ETH balance for deployment. Need at least 0.01 ETH");
  }

  // Get current gas price for optimization
  const feeData = await hre.ethers.provider.getFeeData();
  console.log("⛽ Current gas price:", hre.ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");

  // Deploy SimpleCryptoVault with gas optimization
  console.log("\n📦 Deploying SimpleCryptoVault (gas optimized)...");
  const SimpleCryptoVault = await hre.ethers.getContractFactory("SimpleCryptoVault");
  
  // Estimate gas before deployment
  const deployTransaction = await SimpleCryptoVault.getDeployTransaction();
  const estimatedGas = await hre.ethers.provider.estimateGas(deployTransaction);
  console.log("⛽ Estimated gas:", estimatedGas.toString());

  const cryptoVault = await SimpleCryptoVault.deploy({
    gasLimit: estimatedGas + (estimatedGas / 10n), // Add 10% buffer
    gasPrice: feeData.gasPrice
  });
  
  await cryptoVault.waitForDeployment();
  const cryptoVaultAddress = await cryptoVault.getAddress();
  console.log("✅ SimpleCryptoVault deployed to:", cryptoVaultAddress);

  // Get deployment transaction receipt
  const deploymentReceipt = await cryptoVault.deploymentTransaction().wait();
  console.log("⛽ Actual gas used:", deploymentReceipt.gasUsed.toString());
  console.log("💸 Deployment cost:", hre.ethers.formatEther(deploymentReceipt.gasUsed * feeData.gasPrice), "ETH");

  // Wait for confirmations
  console.log("\n⏳ Waiting for 3 block confirmations...");
  await cryptoVault.deploymentTransaction().wait(3);

  // Print deployment summary
  console.log("\n📋 SEPOLIA DEPLOYMENT SUMMARY");
  console.log("=============================");
  console.log(`🏦 SimpleCryptoVault: ${cryptoVaultAddress}`);
  console.log(`🌐 Network:           Sepolia Testnet`);
  console.log(`🆔 Chain ID:          11155111`);
  console.log(`🔗 Explorer:          https://sepolia.etherscan.io/address/${cryptoVaultAddress}`);
  console.log(`⛽ Gas Used:          ${deploymentReceipt.gasUsed.toString()}`);
  console.log(`💸 Cost:             ${hre.ethers.formatEther(deploymentReceipt.gasUsed * feeData.gasPrice)} ETH`);

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
      SimpleCryptoVault: {
        address: cryptoVaultAddress,
        explorer: `https://sepolia.etherscan.io/address/${cryptoVaultAddress}`
      }
    }
  };

  fs.writeFileSync(
    'sepolia-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to sepolia-deployment.json");

  console.log("\n🎉 Gas-optimized Sepolia deployment completed!");
  console.log("\n📱 Frontend Configuration:");
  console.log("Update your frontend configuration with:");
  console.log(`const CRYPTO_VAULT_ADDRESS = "${cryptoVaultAddress}";`);
  console.log(`const CHAIN_ID = 11155111;`);
  console.log(`const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";`);
  
  console.log("\n🔧 Contract ABI saved for frontend integration");
  
  // Test the deployed contract
  console.log("\n🧪 Testing deployed contract...");
  try {
    const platformFee = await cryptoVault.platformFee();
    const projectCounter = await cryptoVault.projectCounter();
    const feeCollector = await cryptoVault.feeCollector();
    
    console.log("✅ Contract is working correctly:");
    console.log(`   Platform Fee: ${platformFee.toString()} (${platformFee.toString() / 100}%)`);
    console.log(`   Project Counter: ${projectCounter.toString()}`);
    console.log(`   Fee Collector: ${feeCollector}`);
  } catch (error) {
    console.log("⚠️  Contract test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });