const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CryptoVault", function () {
  // Fixture to deploy the contract
  async function deployCryptoVaultFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const CryptoVault = await ethers.getContractFactory("CryptoVault");
    const cryptoVault = await CryptoVault.deploy();

    return { cryptoVault, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { cryptoVault, owner } = await loadFixture(deployCryptoVaultFixture);
      expect(await cryptoVault.owner()).to.equal(owner.address);
    });

    it("Should set initial platform fee", async function () {
      const { cryptoVault } = await loadFixture(deployCryptoVaultFixture);
      expect(await cryptoVault.platformFee()).to.equal(250); // 2.5%
    });

    it("Should set fee collector to owner", async function () {
      const { cryptoVault, owner } = await loadFixture(deployCryptoVaultFixture);
      expect(await cryptoVault.feeCollector()).to.equal(owner.address);
    });
  });

  describe("Project Creation", function () {
    it("Should create a new project", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await expect(
        cryptoVault.connect(addr1).createProject(
          "Test Project",
          "A test project description",
          "DeFi",
          ethers.parseEther("100"),
          30
        )
      ).to.emit(cryptoVault, "ProjectCreated")
        .withArgs(1, addr1.address, "Test Project", ethers.parseEther("100"), anyValue);

      const project = await cryptoVault.getProject(1);
      expect(project.title).to.equal("Test Project");
      expect(project.creator).to.equal(addr1.address);
      expect(project.fundingGoal).to.equal(ethers.parseEther("100"));
      expect(project.isActive).to.be.true;
    });

    it("Should increment project counter", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(addr1).createProject(
        "Project 1",
        "Description 1",
        "DeFi",
        ethers.parseEther("100"),
        30
      );

      await cryptoVault.connect(addr1).createProject(
        "Project 2", 
        "Description 2",
        "NFT",
        ethers.parseEther("200"),
        60
      );

      expect(await cryptoVault.projectCounter()).to.equal(2);
    });

    it("Should fail with empty title", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await expect(
        cryptoVault.connect(addr1).createProject(
          "",
          "Description",
          "DeFi",
          ethers.parseEther("100"),
          30
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should fail with zero funding goal", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await expect(
        cryptoVault.connect(addr1).createProject(
          "Title",
          "Description",
          "DeFi",
          0,
          30
        )
      ).to.be.revertedWith("Funding goal must be greater than 0");
    });

    it("Should fail with invalid duration", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await expect(
        cryptoVault.connect(addr1).createProject(
          "Title",
          "Description", 
          "DeFi",
          ethers.parseEther("100"),
          400 // > 365 days
        )
      ).to.be.revertedWith("Invalid duration");
    });
  });

  describe("Private Contributions", function () {
    it("Should accept a private contribution", async function () {
      const { cryptoVault, addr1, addr2 } = await loadFixture(deployCryptoVaultFixture);

      // Create a project first
      await cryptoVault.connect(addr1).createProject(
        "Test Project",
        "Description",
        "DeFi",
        ethers.parseEther("100"),
        30
      );

      const contributionAmount = ethers.parseEther("1");
      
      // For testing, we'll use mock encrypted data
      const mockEncryptedAmount = "0x1234567890abcdef";
      const mockProof = "0xabcdef1234567890";

      await expect(
        cryptoVault.connect(addr2).contributePrivately(
          1,
          mockEncryptedAmount,
          mockProof,
          { value: contributionAmount }
        )
      ).to.emit(cryptoVault, "PrivateContributionMade")
        .withArgs(1, addr2.address, anyValue);

      const project = await cryptoVault.getProject(1);
      expect(project.totalRaised).to.equal(contributionAmount);
      expect(project.contributorCount).to.equal(1);
    });

    it("Should fail contribution to non-existent project", async function () {
      const { cryptoVault, addr2 } = await loadFixture(deployCryptoVaultFixture);

      const mockEncryptedAmount = "0x1234567890abcdef";
      const mockProof = "0xabcdef1234567890";

      await expect(
        cryptoVault.connect(addr2).contributePrivately(
          999,
          mockEncryptedAmount,
          mockProof,
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Project does not exist");
    });

    it("Should fail contribution with zero value", async function () {
      const { cryptoVault, addr1, addr2 } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(addr1).createProject(
        "Test Project",
        "Description",
        "DeFi", 
        ethers.parseEther("100"),
        30
      );

      const mockEncryptedAmount = "0x1234567890abcdef";
      const mockProof = "0xabcdef1234567890";

      await expect(
        cryptoVault.connect(addr2).contributePrivately(
          1,
          mockEncryptedAmount,
          mockProof,
          { value: 0 }
        )
      ).to.be.revertedWith("Contribution must be greater than 0");
    });
  });

  describe("Fund Withdrawal", function () {
    it("Should allow creator to withdraw when goal is reached", async function () {
      const { cryptoVault, addr1, addr2, addr3 } = await loadFixture(deployCryptoVaultFixture);

      // Create project
      await cryptoVault.connect(addr1).createProject(
        "Test Project",
        "Description", 
        "DeFi",
        ethers.parseEther("2"),
        30
      );

      const mockEncryptedAmount = "0x1234567890abcdef";
      const mockProof = "0xabcdef1234567890";

      // Make contributions to reach goal
      await cryptoVault.connect(addr2).contributePrivately(
        1,
        mockEncryptedAmount,
        mockProof,
        { value: ethers.parseEther("1") }
      );

      await cryptoVault.connect(addr3).contributePrivately(
        1,
        mockEncryptedAmount,
        mockProof,
        { value: ethers.parseEther("1") }
      );

      const project = await cryptoVault.getProject(1);
      expect(project.goalReached).to.be.true;

      // Withdraw funds
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      await expect(
        cryptoVault.connect(addr1).withdrawFunds(1)
      ).to.emit(cryptoVault, "FundsWithdrawn");

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail withdrawal by non-creator", async function () {
      const { cryptoVault, addr1, addr2 } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(addr1).createProject(
        "Test Project",
        "Description",
        "DeFi",
        ethers.parseEther("1"),
        30
      );

      await expect(
        cryptoVault.connect(addr2).withdrawFunds(1)
      ).to.be.revertedWith("Only project creator can withdraw");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      const { cryptoVault, owner } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(owner).updatePlatformFee(500); // 5%
      expect(await cryptoVault.platformFee()).to.equal(500);
    });

    it("Should fail to update platform fee above 10%", async function () {
      const { cryptoVault, owner } = await loadFixture(deployCryptoVaultFixture);

      await expect(
        cryptoVault.connect(owner).updatePlatformFee(1500) // 15%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should allow owner to emergency pause project", async function () {
      const { cryptoVault, owner, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(addr1).createProject(
        "Test Project",
        "Description",
        "DeFi",
        ethers.parseEther("100"),
        30
      );

      await cryptoVault.connect(owner).emergencyPause(1);
      
      const project = await cryptoVault.getProject(1);
      expect(project.isActive).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("Should return correct project status", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(addr1).createProject(
        "Test Project",
        "Description",
        "DeFi", 
        ethers.parseEther("100"),
        30
      );

      const status = await cryptoVault.getProjectStatus(1);
      expect(status).to.equal(0); // ProjectStatus.Active
    });

    it("Should return active projects", async function () {
      const { cryptoVault, addr1 } = await loadFixture(deployCryptoVaultFixture);

      await cryptoVault.connect(addr1).createProject(
        "Project 1",
        "Description 1",
        "DeFi",
        ethers.parseEther("100"),
        30
      );

      await cryptoVault.connect(addr1).createProject(
        "Project 2",
        "Description 2", 
        "NFT",
        ethers.parseEther("200"),
        60
      );

      const activeProjects = await cryptoVault.getActiveProjects();
      expect(activeProjects.length).to.equal(2);
      expect(activeProjects[0]).to.equal(1);
      expect(activeProjects[1]).to.equal(2);
    });
  });
});

// Helper function for testing events with any value
const anyValue = require("@nomicfoundation/hardhat-chai-matchers/withArgs");