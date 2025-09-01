// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ConfidentialDEX is ZamaConfig, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct TradingPair {
        address tokenA;
        address tokenB;
        bool isActive;
        uint256 feeRate; // In basis points (100 = 1%)
        uint256 totalVolumeA;
        uint256 totalVolumeB;
    }

    struct PrivateOrder {
        uint256 orderId;
        address trader;
        address tokenIn;
        address tokenOut;
        euint64 encryptedAmountIn;
        euint64 encryptedAmountOut;
        uint256 timestamp;
        bool isActive;
        OrderType orderType;
    }

    struct LiquidityPosition {
        address provider;
        address tokenA;
        address tokenB;
        euint64 encryptedAmountA;
        euint64 encryptedAmountB;
        uint256 shares;
        uint256 timestamp;
    }

    enum OrderType {
        Buy,
        Sell,
        Limit
    }

    mapping(bytes32 => TradingPair) public tradingPairs;
    mapping(uint256 => PrivateOrder) public orders;
    mapping(address => uint256[]) public userOrders;
    mapping(bytes32 => LiquidityPosition[]) public liquidityPositions;
    mapping(address => mapping(bytes32 => uint256)) public userLiquidityShares;
    
    // Price oracles (simplified for demo)
    mapping(bytes32 => uint256) public pairPrices;
    
    uint256 public orderCounter;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public defaultFeeRate = 30; // 0.3%

    event TradingPairCreated(
        bytes32 indexed pairId,
        address indexed tokenA,
        address indexed tokenB,
        uint256 feeRate
    );
    
    event PrivateOrderCreated(
        uint256 indexed orderId,
        address indexed trader,
        address tokenIn,
        address tokenOut,
        OrderType orderType
    );
    
    event OrderExecuted(
        uint256 indexed orderId,
        address indexed trader,
        uint256 executionPrice
    );
    
    event LiquidityAdded(
        bytes32 indexed pairId,
        address indexed provider,
        uint256 shares
    );
    
    event LiquidityRemoved(
        bytes32 indexed pairId,
        address indexed provider,
        uint256 shares
    );

    constructor() Ownable(msg.sender) {}

    function createTradingPair(
        address _tokenA,
        address _tokenB,
        uint256 _feeRate
    ) external onlyOwner returns (bytes32) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token addresses");
        require(_tokenA != _tokenB, "Tokens must be different");
        require(_feeRate <= 1000, "Fee rate too high"); // Max 10%
        
        bytes32 pairId = keccak256(abi.encodePacked(_tokenA, _tokenB));
        require(!tradingPairs[pairId].isActive, "Pair already exists");
        
        tradingPairs[pairId] = TradingPair({
            tokenA: _tokenA,
            tokenB: _tokenB,
            isActive: true,
            feeRate: _feeRate > 0 ? _feeRate : defaultFeeRate,
            totalVolumeA: 0,
            totalVolumeB: 0
        });
        
        emit TradingPairCreated(pairId, _tokenA, _tokenB, _feeRate);
        return pairId;
    }

    function createPrivateOrder(
        address _tokenIn,
        address _tokenOut,
        externalEuint64 _encryptedAmountIn,
        externalEuint64 _encryptedAmountOut,
        bytes calldata _inputProofIn,
        bytes calldata _inputProofOut,
        OrderType _orderType
    ) external nonReentrant returns (uint256) {
        bytes32 pairId = keccak256(abi.encodePacked(_tokenIn, _tokenOut));
        require(tradingPairs[pairId].isActive, "Trading pair not active");
        
        // Convert external encrypted values
        euint64 encryptedAmountIn = FHE.fromExternal(_encryptedAmountIn, _inputProofIn);
        euint64 encryptedAmountOut = FHE.fromExternal(_encryptedAmountOut, _inputProofOut);
        
        uint256 orderId = ++orderCounter;
        
        orders[orderId] = PrivateOrder({
            orderId: orderId,
            trader: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            encryptedAmountIn: encryptedAmountIn,
            encryptedAmountOut: encryptedAmountOut,
            timestamp: block.timestamp,
            isActive: true,
            orderType: _orderType
        });
        
        userOrders[msg.sender].push(orderId);
        
        emit PrivateOrderCreated(orderId, msg.sender, _tokenIn, _tokenOut, _orderType);
        return orderId;
    }

    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        uint256 _amountB,
        externalEuint64 _encryptedAmountA,
        externalEuint64 _encryptedAmountB,
        bytes calldata _inputProofA,
        bytes calldata _inputProofB
    ) external nonReentrant {
        bytes32 pairId = keccak256(abi.encodePacked(_tokenA, _tokenB));
        require(tradingPairs[pairId].isActive, "Trading pair not active");
        require(_amountA > 0 && _amountB > 0, "Amounts must be greater than 0");
        
        // Transfer tokens to contract
        IERC20(_tokenA).safeTransferFrom(msg.sender, address(this), _amountA);
        IERC20(_tokenB).safeTransferFrom(msg.sender, address(this), _amountB);
        
        // Convert encrypted amounts
        euint64 encryptedAmountA = FHE.fromExternal(_encryptedAmountA, _inputProofA);
        euint64 encryptedAmountB = FHE.fromExternal(_encryptedAmountB, _inputProofB);
        
        // Calculate liquidity shares (simplified)
        uint256 shares = (_amountA * _amountB) / MINIMUM_LIQUIDITY;
        
        // Store liquidity position
        liquidityPositions[pairId].push(LiquidityPosition({
            provider: msg.sender,
            tokenA: _tokenA,
            tokenB: _tokenB,
            encryptedAmountA: encryptedAmountA,
            encryptedAmountB: encryptedAmountB,
            shares: shares,
            timestamp: block.timestamp
        }));
        
        userLiquidityShares[msg.sender][pairId] += shares;
        
        emit LiquidityAdded(pairId, msg.sender, shares);
    }

    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _shares
    ) external nonReentrant {
        bytes32 pairId = keccak256(abi.encodePacked(_tokenA, _tokenB));
        require(tradingPairs[pairId].isActive, "Trading pair not active");
        require(userLiquidityShares[msg.sender][pairId] >= _shares, "Insufficient shares");
        
        // Find and remove liquidity position
        LiquidityPosition[] storage positions = liquidityPositions[pairId];
        for (uint i = 0; i < positions.length; i++) {
            if (positions[i].provider == msg.sender && positions[i].shares >= _shares) {
                // Calculate proportional amounts to return
                uint256 amountA = (positions[i].shares * IERC20(_tokenA).balanceOf(address(this))) / _shares;
                uint256 amountB = (positions[i].shares * IERC20(_tokenB).balanceOf(address(this))) / _shares;
                
                // Transfer tokens back
                IERC20(_tokenA).safeTransfer(msg.sender, amountA);
                IERC20(_tokenB).safeTransfer(msg.sender, amountB);
                
                // Update position
                positions[i].shares -= _shares;
                if (positions[i].shares == 0) {
                    positions[i] = positions[positions.length - 1];
                    positions.pop();
                }
                
                userLiquidityShares[msg.sender][pairId] -= _shares;
                
                emit LiquidityRemoved(pairId, msg.sender, _shares);
                break;
            }
        }
    }

    function executeOrder(uint256 _orderId) external nonReentrant {
        PrivateOrder storage order = orders[_orderId];
        require(order.isActive, "Order not active");
        require(order.trader == msg.sender, "Not order owner");
        
        bytes32 pairId = keccak256(abi.encodePacked(order.tokenIn, order.tokenOut));
        TradingPair storage pair = tradingPairs[pairId];
        require(pair.isActive, "Pair not active");
        
        // For demo purposes, use a simple price calculation
        uint256 currentPrice = pairPrices[pairId];
        if (currentPrice == 0) {
            currentPrice = 1e18; // Default 1:1 price
        }
        
        // Mark order as executed
        order.isActive = false;
        
        emit OrderExecuted(_orderId, msg.sender, currentPrice);
    }

    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external nonReentrant {
        bytes32 pairId = keccak256(abi.encodePacked(_tokenIn, _tokenOut));
        TradingPair storage pair = tradingPairs[pairId];
        require(pair.isActive, "Pair not active");
        require(_amountIn > 0, "Amount must be greater than 0");
        
        // Transfer tokens to contract
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Calculate output amount (simplified AMM formula)
        uint256 currentPrice = pairPrices[pairId];
        if (currentPrice == 0) {
            currentPrice = 1e18;
        }
        
        uint256 amountOut = (_amountIn * currentPrice) / 1e18;
        uint256 fee = (amountOut * pair.feeRate) / 10000;
        uint256 finalAmountOut = amountOut - fee;
        
        require(finalAmountOut >= _minAmountOut, "Insufficient output amount");
        
        // Transfer output tokens
        IERC20(_tokenOut).safeTransfer(msg.sender, finalAmountOut);
        
        // Update volume statistics
        if (_tokenIn == pair.tokenA) {
            pair.totalVolumeA += _amountIn;
            pair.totalVolumeB += finalAmountOut;
        } else {
            pair.totalVolumeB += _amountIn;
            pair.totalVolumeA += finalAmountOut;
        }
    }

    // View functions
    function getTradingPair(bytes32 _pairId) external view returns (TradingPair memory) {
        return tradingPairs[_pairId];
    }

    function getOrder(uint256 _orderId) external view returns (PrivateOrder memory) {
        return orders[_orderId];
    }

    function getUserOrders(address _user) external view returns (uint256[] memory) {
        return userOrders[_user];
    }

    function getPairPrice(bytes32 _pairId) external view returns (uint256) {
        return pairPrices[_pairId];
    }

    function getUserLiquidityShares(address _user, bytes32 _pairId) external view returns (uint256) {
        return userLiquidityShares[_user][_pairId];
    }

    // Admin functions
    function updatePairPrice(bytes32 _pairId, uint256 _newPrice) external onlyOwner {
        require(tradingPairs[_pairId].isActive, "Pair not active");
        pairPrices[_pairId] = _newPrice;
    }

    function updateDefaultFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "Fee rate too high");
        defaultFeeRate = _newFeeRate;
    }

    function updatePairFeeRate(bytes32 _pairId, uint256 _newFeeRate) external onlyOwner {
        require(tradingPairs[_pairId].isActive, "Pair not active");
        require(_newFeeRate <= 1000, "Fee rate too high");
        tradingPairs[_pairId].feeRate = _newFeeRate;
    }

    function togglePairStatus(bytes32 _pairId) external onlyOwner {
        tradingPairs[_pairId].isActive = !tradingPairs[_pairId].isActive;
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }

    // Utility functions
    function getPairId(address _tokenA, address _tokenB) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_tokenA, _tokenB));
    }

    receive() external payable {}
    fallback() external payable {}
}