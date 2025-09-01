const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("ConfidentialDEX", function () {
  async function deployConfidentialDEXFixture() {
    const [owner, trader1, trader2, liquidityProvider] = await ethers.getSigners();

    const ConfidentialDEX = await ethers.getContractFactory("ConfidentialDEX");
    const dex = await ConfidentialDEX.deploy();

    // Deploy mock tokens for testing
    const MockToken = await ethers.getContractFactory("MockToken");
    const tokenA = await MockToken.deploy("Token A", "TKA", 18, 1000000);
    const tokenB = await MockToken.deploy("Token B", "TKB", 18, 1000000);

    // Distribute tokens to test accounts
    await tokenA.transfer(trader1.address, ethers.parseEther("1000"));
    await tokenA.transfer(trader2.address, ethers.parseEther("1000"));
    await tokenA.transfer(liquidityProvider.address, ethers.parseEther("10000"));

    await tokenB.transfer(trader1.address, ethers.parseEther("1000"));
    await tokenB.transfer(trader2.address, ethers.parseEther("1000"));
    await tokenB.transfer(liquidityProvider.address, ethers.parseEther("10000"));

    return { dex, tokenA, tokenB, owner, trader1, trader2, liquidityProvider };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { dex, owner } = await loadFixture(deployConfidentialDEXFixture);
      expect(await dex.owner()).to.equal(owner.address);
    });

    it("Should set default fee rate", async function () {
      const { dex } = await loadFixture(deployConfidentialDEXFixture);
      expect(await dex.defaultFeeRate()).to.equal(30); // 0.3%
    });
  });

  describe("Trading Pair Management", function () {
    it("Should create a new trading pair", async function () {
      const { dex, tokenA, tokenB, owner } = await loadFixture(deployConfidentialDEXFixture);

      await expect(
        dex.connect(owner).createTradingPair(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          50 // 0.5% fee
        )
      ).to.emit(dex, "TradingPairCreated");

      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      const pair = await dex.getTradingPair(pairId);
      
      expect(pair.tokenA).to.equal(await tokenA.getAddress());
      expect(pair.tokenB).to.equal(await tokenB.getAddress());
      expect(pair.isActive).to.be.true;
      expect(pair.feeRate).to.equal(50);
    });

    it("Should fail to create pair with same tokens", async function () {
      const { dex, tokenA, owner } = await loadFixture(deployConfidentialDEXFixture);

      await expect(
        dex.connect(owner).createTradingPair(
          await tokenA.getAddress(),
          await tokenA.getAddress(),
          50
        )
      ).to.be.revertedWith("Tokens must be different");
    });

    it("Should fail to create pair with high fee", async function () {
      const { dex, tokenA, tokenB, owner } = await loadFixture(deployConfidentialDEXFixture);

      await expect(
        dex.connect(owner).createTradingPair(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          1500 // 15% fee (too high)
        )
      ).to.be.revertedWith("Fee rate too high");
    });

    it("Should fail to create duplicate pair", async function () {
      const { dex, tokenA, tokenB, owner } = await loadFixture(deployConfidentialDEXFixture);

      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      await expect(
        dex.connect(owner).createTradingPair(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          100
        )
      ).to.be.revertedWith("Pair already exists");
    });
  });

  describe("Private Orders", function () {
    it("Should create a private order", async function () {
      const { dex, tokenA, tokenB, owner, trader1 } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Mock encrypted data for testing
      const mockEncryptedAmountIn = "0x1234567890abcdef";
      const mockEncryptedAmountOut = "0xabcdef1234567890";
      const mockProofIn = "0x1111111111111111";
      const mockProofOut = "0x2222222222222222";

      await expect(
        dex.connect(trader1).createPrivateOrder(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          mockEncryptedAmountIn,
          mockEncryptedAmountOut,
          mockProofIn,
          mockProofOut,
          0 // OrderType.Buy
        )
      ).to.emit(dex, "PrivateOrderCreated")
        .withArgs(1, trader1.address, await tokenA.getAddress(), await tokenB.getAddress(), 0);

      const order = await dex.getOrder(1);
      expect(order.trader).to.equal(trader1.address);
      expect(order.tokenIn).to.equal(await tokenA.getAddress());
      expect(order.tokenOut).to.equal(await tokenB.getAddress());
      expect(order.isActive).to.be.true;
    });

    it("Should fail to create order for inactive pair", async function () {
      const { dex, tokenA, tokenB, trader1 } = await loadFixture(deployConfidentialDEXFixture);

      const mockEncryptedAmountIn = "0x1234567890abcdef";
      const mockEncryptedAmountOut = "0xabcdef1234567890"; 
      const mockProofIn = "0x1111111111111111";
      const mockProofOut = "0x2222222222222222";

      await expect(
        dex.connect(trader1).createPrivateOrder(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          mockEncryptedAmountIn,
          mockEncryptedAmountOut,
          mockProofIn,
          mockProofOut,
          0
        )
      ).to.be.revertedWith("Trading pair not active");
    });

    it("Should execute an order", async function () {
      const { dex, tokenA, tokenB, owner, trader1 } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Create order
      const mockEncryptedAmountIn = "0x1234567890abcdef";
      const mockEncryptedAmountOut = "0xabcdef1234567890";
      const mockProofIn = "0x1111111111111111";
      const mockProofOut = "0x2222222222222222";

      await dex.connect(trader1).createPrivateOrder(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        mockEncryptedAmountIn,
        mockEncryptedAmountOut,
        mockProofIn,
        mockProofOut,
        0
      );

      // Execute order
      await expect(
        dex.connect(trader1).executeOrder(1)
      ).to.emit(dex, "OrderExecuted")
        .withArgs(1, trader1.address, anyValue);

      const order = await dex.getOrder(1);
      expect(order.isActive).to.be.false;
    });
  });

  describe("Token Swaps", function () {
    it("Should perform a token swap", async function () {
      const { dex, tokenA, tokenB, owner, trader1 } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Set initial price
      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      await dex.connect(owner).updatePairPrice(pairId, ethers.parseEther("2")); // 1 TKA = 2 TKB

      // Approve tokens
      await tokenA.connect(trader1).approve(await dex.getAddress(), ethers.parseEther("10"));

      // Add some liquidity to DEX contract for the swap
      await tokenB.transfer(await dex.getAddress(), ethers.parseEther("1000"));

      const swapAmount = ethers.parseEther("1");
      const expectedOutput = ethers.parseEther("2"); // 1 TKA = 2 TKB
      const minOutput = ethers.parseEther("1.8"); // Allow for slippage and fees

      await expect(
        dex.connect(trader1).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOutput
        )
      ).to.not.be.reverted;

      const pair = await dex.getTradingPair(pairId);
      expect(pair.totalVolumeA).to.equal(swapAmount);
    });

    it("Should fail swap with insufficient output", async function () {
      const { dex, tokenA, tokenB, owner, trader1 } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Set price
      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      await dex.connect(owner).updatePairPrice(pairId, ethers.parseEther("2"));

      // Approve tokens
      await tokenA.connect(trader1).approve(await dex.getAddress(), ethers.parseEther("10"));
      await tokenB.transfer(await dex.getAddress(), ethers.parseEther("1000"));

      const swapAmount = ethers.parseEther("1");
      const minOutput = ethers.parseEther("10"); // Too high expectation

      await expect(
        dex.connect(trader1).swapTokens(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          swapAmount,
          minOutput
        )
      ).to.be.revertedWith("Insufficient output amount");
    });
  });

  describe("Liquidity Management", function () {
    it("Should add liquidity", async function () {
      const { dex, tokenA, tokenB, owner, liquidityProvider } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Approve tokens
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");
      
      await tokenA.connect(liquidityProvider).approve(await dex.getAddress(), amountA);
      await tokenB.connect(liquidityProvider).approve(await dex.getAddress(), amountB);

      // Mock encrypted amounts
      const mockEncryptedAmountA = "0x1234567890abcdef";
      const mockEncryptedAmountB = "0xabcdef1234567890";
      const mockProofA = "0x1111111111111111";
      const mockProofB = "0x2222222222222222";

      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());

      await expect(
        dex.connect(liquidityProvider).addLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          amountA,
          amountB,
          mockEncryptedAmountA,
          mockEncryptedAmountB,
          mockProofA,
          mockProofB
        )
      ).to.emit(dex, "LiquidityAdded")
        .withArgs(pairId, liquidityProvider.address, anyValue);

      const shares = await dex.getUserLiquidityShares(liquidityProvider.address, pairId);
      expect(shares).to.be.gt(0);
    });

    it("Should remove liquidity", async function () {
      const { dex, tokenA, tokenB, owner, liquidityProvider } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Add liquidity first
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");
      
      await tokenA.connect(liquidityProvider).approve(await dex.getAddress(), amountA);
      await tokenB.connect(liquidityProvider).approve(await dex.getAddress(), amountB);

      const mockEncryptedAmountA = "0x1234567890abcdef";
      const mockEncryptedAmountB = "0xabcdef1234567890";
      const mockProofA = "0x1111111111111111";
      const mockProofB = "0x2222222222222222";

      await dex.connect(liquidityProvider).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        amountA,
        amountB,
        mockEncryptedAmountA,
        mockEncryptedAmountB,
        mockProofA,
        mockProofB
      );

      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      const initialShares = await dex.getUserLiquidityShares(liquidityProvider.address, pairId);
      const sharesToRemove = initialShares / 2n;

      await expect(
        dex.connect(liquidityProvider).removeLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          sharesToRemove
        )
      ).to.emit(dex, "LiquidityRemoved")
        .withArgs(pairId, liquidityProvider.address, sharesToRemove);

      const finalShares = await dex.getUserLiquidityShares(liquidityProvider.address, pairId);
      expect(finalShares).to.equal(initialShares - sharesToRemove);
    });
  });

  describe("Admin Functions", function () {
    it("Should update default fee rate", async function () {
      const { dex, owner } = await loadFixture(deployConfidentialDEXFixture);

      await dex.connect(owner).updateDefaultFeeRate(100); // 1%
      expect(await dex.defaultFeeRate()).to.equal(100);
    });

    it("Should fail to set fee rate too high", async function () {
      const { dex, owner } = await loadFixture(deployConfidentialDEXFixture);

      await expect(
        dex.connect(owner).updateDefaultFeeRate(1500) // 15%
      ).to.be.revertedWith("Fee rate too high");
    });

    it("Should update pair price", async function () {
      const { dex, tokenA, tokenB, owner } = await loadFixture(deployConfidentialDEXFixture);

      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      const newPrice = ethers.parseEther("1.5");

      await dex.connect(owner).updatePairPrice(pairId, newPrice);
      expect(await dex.getPairPrice(pairId)).to.equal(newPrice);
    });

    it("Should toggle pair status", async function () {
      const { dex, tokenA, tokenB, owner } = await loadFixture(deployConfidentialDEXFixture);

      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      
      // Initially active
      let pair = await dex.getTradingPair(pairId);
      expect(pair.isActive).to.be.true;

      // Toggle to inactive
      await dex.connect(owner).togglePairStatus(pairId);
      pair = await dex.getTradingPair(pairId);
      expect(pair.isActive).to.be.false;

      // Toggle back to active
      await dex.connect(owner).togglePairStatus(pairId);
      pair = await dex.getTradingPair(pairId);
      expect(pair.isActive).to.be.true;
    });
  });

  describe("Utility Functions", function () {
    it("Should generate correct pair ID", async function () {
      const { dex, tokenA, tokenB } = await loadFixture(deployConfidentialDEXFixture);

      const pairId = await dex.getPairId(await tokenA.getAddress(), await tokenB.getAddress());
      expect(pairId).to.be.a('string');
      expect(pairId.length).to.equal(66); // 0x + 64 hex characters
    });

    it("Should return user orders", async function () {
      const { dex, tokenA, tokenB, owner, trader1 } = await loadFixture(deployConfidentialDEXFixture);

      // Create trading pair
      await dex.connect(owner).createTradingPair(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        50
      );

      // Create orders
      const mockEncryptedAmountIn = "0x1234567890abcdef";
      const mockEncryptedAmountOut = "0xabcdef1234567890";
      const mockProofIn = "0x1111111111111111";
      const mockProofOut = "0x2222222222222222";

      await dex.connect(trader1).createPrivateOrder(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        mockEncryptedAmountIn,
        mockEncryptedAmountOut,
        mockProofIn,
        mockProofOut,
        0
      );

      await dex.connect(trader1).createPrivateOrder(
        await tokenB.getAddress(),
        await tokenA.getAddress(),
        mockEncryptedAmountIn,
        mockEncryptedAmountOut,
        mockProofIn,
        mockProofOut,
        1
      );

      const userOrders = await dex.getUserOrders(trader1.address);
      expect(userOrders.length).to.equal(2);
      expect(userOrders[0]).to.equal(1);
      expect(userOrders[1]).to.equal(2);
    });
  });
});

const anyValue = require("@nomicfoundation/hardhat-chai-matchers/withArgs");