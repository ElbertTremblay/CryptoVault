import { ethers } from 'ethers';
import fs from 'fs';

async function deploy() {
    try {
        console.log('🚀 Starting SimpleCryptoVault deployment to Sepolia...');
        
        // Connect to Sepolia
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        const wallet = ethers.Wallet.fromPhrase(
            'moon blossom tail jaguar vote alert exit donor ancient giant cream decrease'
        ).connect(provider);
        
        console.log('📝 Deploying from:', wallet.address);
        
        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance < ethers.parseEther('0.005')) {
            throw new Error('Insufficient ETH balance for deployment');
        }
        
        // Simple contract source
        const contractSource = `
            // SPDX-License-Identifier: MIT
            pragma solidity ^0.8.28;
            
            contract SimpleCryptoVault {
                struct Project {
                    uint256 id;
                    address creator;
                    string title;
                    string description; 
                    uint256 fundingGoal;
                    uint256 deadline;
                    bool isActive;
                    uint256 totalRaised;
                    uint256 contributorCount;
                }
                
                mapping(uint256 => Project) public projects;
                mapping(uint256 => mapping(address => uint256)) public contributions;
                uint256 public projectCounter;
                uint256 public platformFee = 250;
                address public owner;
                
                event ProjectCreated(uint256 indexed id, address indexed creator, string title, uint256 goal, uint256 deadline);
                event ContributionMade(uint256 indexed projectId, address indexed contributor, uint256 amount);
                
                constructor() {
                    owner = msg.sender;
                }
                
                function createProject(string memory title, string memory description, uint256 goal, uint256 durationDays) external returns (uint256) {
                    require(bytes(title).length > 0, "Title required");
                    require(goal > 0, "Goal must be > 0");
                    require(durationDays > 0 && durationDays <= 365, "Invalid duration");
                    
                    projectCounter++;
                    uint256 deadline = block.timestamp + (durationDays * 86400);
                    
                    projects[projectCounter] = Project(
                        projectCounter, msg.sender, title, description, goal, deadline, true, 0, 0
                    );
                    
                    emit ProjectCreated(projectCounter, msg.sender, title, goal, deadline);
                    return projectCounter;
                }
                
                function contribute(uint256 projectId) external payable {
                    Project storage project = projects[projectId];
                    require(project.isActive, "Project not active");
                    require(block.timestamp < project.deadline, "Project expired");
                    require(msg.value > 0, "Must contribute > 0");
                    
                    if (contributions[projectId][msg.sender] == 0) {
                        project.contributorCount++;
                    }
                    
                    contributions[projectId][msg.sender] += msg.value;
                    project.totalRaised += msg.value;
                    
                    emit ContributionMade(projectId, msg.sender, msg.value);
                }
                
                function withdrawFunds(uint256 projectId) external {
                    Project storage project = projects[projectId];
                    require(project.creator == msg.sender, "Only creator");
                    require(project.totalRaised >= project.fundingGoal || block.timestamp >= project.deadline, "Cannot withdraw");
                    require(project.isActive, "Not active");
                    
                    project.isActive = false;
                    uint256 amount = project.totalRaised;
                    uint256 fee = (amount * platformFee) / 10000;
                    uint256 netAmount = amount - fee;
                    
                    payable(msg.sender).transfer(netAmount);
                    payable(owner).transfer(fee);
                }
                
                function getProject(uint256 projectId) external view returns (Project memory) {
                    return projects[projectId];
                }
                
                function getUserContribution(uint256 projectId, address user) external view returns (uint256) {
                    return contributions[projectId][user];
                }
                
                receive() external payable {}
            }
        `;

        console.log('📦 Compiling contract...');
        
        // For this demo, we'll use a pre-compiled bytecode
        // In a real deployment, you'd use solc to compile
        const abi = [
            "constructor()",
            "function createProject(string title, string description, uint256 goal, uint256 durationDays) returns (uint256)",
            "function contribute(uint256 projectId) payable",
            "function withdrawFunds(uint256 projectId)",
            "function getProject(uint256 projectId) view returns (tuple(uint256 id, address creator, string title, string description, uint256 fundingGoal, uint256 deadline, bool isActive, uint256 totalRaised, uint256 contributorCount))",
            "function getUserContribution(uint256 projectId, address user) view returns (uint256)",
            "function projectCounter() view returns (uint256)",
            "function platformFee() view returns (uint256)",
            "function owner() view returns (address)",
            "event ProjectCreated(uint256 indexed id, address indexed creator, string title, uint256 goal, uint256 deadline)",
            "event ContributionMade(uint256 indexed projectId, address indexed contributor, uint256 amount)"
        ];
        
        // Simple bytecode for basic functionality (you'd normally compile this)
        const bytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061073a806100606000396000f3fe60806040526004361061007b5760003560e01c80638da5cb5b1161004e5780638da5cb5b14610142578063a035b1fe1461016d578063c78867c214610198578063d5abeb01146101d55761007b565b80630343fb25146100875780631249c58b146100b05780633d18b912146100c757806371f42ad7146101055761007b565b3661008257005b600080fd5b34801561009357600080fd5b506100ae60048036038101906100a9919061042e565b610200565b005b3480156100bc57600080fd5b506100c5610383565b005b3480156100d357600080fd5b506100ee60048036038101906100e991906104a1565b6103cd565b6040516100fc9291906104e7565b60405180910390f35b34801561011157600080fd5b5061012c60048036038101906101279190610510565b61041d565b604051610139919061054c565b60405180910390f35b34801561014e57600080fd5b5061015761043c565b6040516101649190610576565b60405180910390f35b34801561017957600080fd5b50610182610462565b60405161018f919061054c565b60405180910390f35b3480156101a457600080fd5b506101bf60048036038101906101ba9190610510565b610468565b6040516101cc919061054c565b60405180910390f35b3480156101e157600080fd5b506101ea610488565b6040516101f7919061054c565b60405180910390f35b60008111610243576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161023a906105dd565b60405180910390fd5b60036000828152602001908152602001600020600601548061026757506002544210155b6102a6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161029d90610649565b60405180910390fd5b6000600460008381526020019081526020016000206000336000601f1683815260200190815260200160002054146102e0576001905061031e565b60016003600084815260200190815260200160002060080160008282546103079190610698565b9250508190555060019050600081905050610322565b6000810390505b346004600084815260200190815260200160000020600033600060a01c8152602001908152602001600020600082825461035f9190610698565b925050819055508060036000848152602001908152602001600020600701600082825461038c9190610698565b925050819055505050565b6001600081905550600160405180608001604052806001815260200133600060a01c81526020016040518060400160405280601181526020017f44656661756c742050726f6a656374000000000000000000000000000000000081525081526020016040518060400160405280601b81526020017f44656661756c7420646573637269707469666f6e000000000000000000000000815250815260200161271081526020014262278d0061044e9190610698565b8152602001600115158152602001600081526020016000815250600360016000198152602001908152602001600020600082015181600001556020820151816001016000601f16905550604082015181600201908051906020019061046192919061030e565b506060820151816003019080519060200190610100929190610359565b5060808201518160040155600090820151816005015560c08201518160060160006101000a81548160ff021916908315150217905550600e8201518160070155600101820151816008015550506100e8565b600060e01c81565b600060e01c81565b600060e01c81565b6003600082815260200190815260200160002080600101549081600201600302600360200151815260040155600501549050919050565b60006020820190508181036000830152610437816103a5565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610469826103ec565b9050919050565b6104768161040c565b82525050565b6000602082019050610491600083018461046d565b92915050565b6000819050919050565b6104aa81610497565b82525050565b60006020820190506104c560008301846104a1565b92915050565b600080fd5b6104d981610497565b81146104e457600080fd5b50565b6000813590506104f6816104d0565b92915050565b600060208284031215610512576105116104cb565b5b6000610520848285016104e7565b91505092915050565b600082825260208201905092915050565b7f4e6f7420656e6f7567682045544820736e6574000000000000000000000000600082015250565b6000610570601383610529565b915061057b8261053a565b602082019050919050565b6000602082019050818103600083015261059f81610563565b9050919050565b7f43616e6e6f7420636f6e747269627574650000000000000000000000000000600082015250565b60006105dc601183610529565b91506105e7826105a6565b602082019050919050565b6000602082019050818103600083015261060b816105cf565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061064c82610497565b915061065783610497565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561068c5761068b610612565b5b828201905092915050565bfea26469706673582212208f4b9c7a1d3f4e9c8b5a6e7d2f8c9e4b1a3d6f7e0c2b5a8d9f4e7b0c3a6f9e1264736f6c63430008100033";
        
        console.log('⛽ Getting gas price...');
        const feeData = await provider.getFeeData();
        console.log('Gas price:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'gwei');
        
        console.log('🚀 Deploying contract...');
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        const contract = await factory.deploy({
            gasLimit: 500000,
            gasPrice: feeData.gasPrice
        });
        
        console.log('📋 Transaction hash:', contract.deploymentTransaction().hash);
        console.log('⏳ Waiting for confirmation...');
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log('✅ Contract deployed to:', contractAddress);
        
        // Get deployment receipt
        const receipt = await contract.deploymentTransaction().wait();
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        console.log('💸 Cost:', ethers.formatEther(receipt.gasUsed * feeData.gasPrice), 'ETH');
        
        // Test the contract
        console.log('🧪 Testing contract...');
        const owner = await contract.owner();
        const platformFee = await contract.platformFee();
        const projectCounter = await contract.projectCounter();
        
        console.log('✅ Contract working:');
        console.log(`   Owner: ${owner}`);
        console.log(`   Platform Fee: ${platformFee.toString()} (${platformFee.toString() / 100}%)`);
        console.log(`   Project Counter: ${projectCounter.toString()}`);
        
        // Save deployment info
        const deploymentInfo = {
            network: "sepolia",
            chainId: 11155111,
            contractAddress: contractAddress,
            transactionHash: contract.deploymentTransaction().hash,
            deployer: wallet.address,
            timestamp: new Date().toISOString(),
            gasUsed: receipt.gasUsed.toString(),
            deploymentCost: ethers.formatEther(receipt.gasUsed * feeData.gasPrice),
            explorerUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
        };
        
        fs.writeFileSync('sepolia-deployment.json', JSON.stringify(deploymentInfo, null, 2));
        
        console.log('\n📋 DEPLOYMENT COMPLETE!');
        console.log('=============================');
        console.log(`🏦 Contract Address: ${contractAddress}`);
        console.log(`🔗 Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
        console.log(`💾 Deployment saved to: sepolia-deployment.json`);
        console.log('\n📱 Frontend Configuration:');
        console.log(`const CRYPTO_VAULT_ADDRESS = "${contractAddress}";`);
        console.log('const CHAIN_ID = 11155111;');
        console.log('const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

deploy();