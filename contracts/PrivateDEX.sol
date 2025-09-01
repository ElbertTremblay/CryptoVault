// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract PrivateDEX is SepoliaConfig {
    
    enum OrderStatus {
        Active,
        PartiallyFilled,
        Filled,
        Cancelled,
        DecryptionInProgress,
        ResultsDecrypted
    }
    
    struct TradingPair {
        address tokenA;
        address tokenB;
        string symbolA;
        string symbolB;
        bool active;
        uint256 totalVolume;
        uint256 lastPrice;
    }
    
    struct Order {
        uint256 id;
        address trader;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        bool isBuyOrder;
        OrderStatus status;
        uint256 timestamp;
        bool isPrivate;
        uint256 filledAmount;
        uint256 decryptedAmount;
    }
    
    struct Trade {
        uint256 orderId1;
        uint256 orderId2;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 timestamp;
        bool isPrivateTrade;
    }
    
    mapping(uint256 => TradingPair) public tradingPairs;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => euint64) private encryptedOrderAmounts;
    mapping(address => uint256[]) public userOrders;
    mapping(address => mapping(address => uint256)) public userBalances;
    
    uint256 public pairCounter;
    uint256 public orderCounter;
    uint256 public tradeCounter;
    
    Trade[] public trades;
    
    uint256 constant public FEE_RATE = 30; // 0.3% = 30/10000
    address public feeRecipient;
    
    event TradingPairCreated(uint256 indexed pairId, address tokenA, address tokenB, string symbolA, string symbolB);
    event OrderCreated(uint256 indexed orderId, address indexed trader, address tokenIn, address tokenOut, uint256 amountIn, bool isPrivate);
    event OrderFilled(uint256 indexed orderId, uint256 filledAmount);
    event OrderCancelled(uint256 indexed orderId);
    event TradeExecuted(uint256 indexed tradeId, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    event DecryptionRequested(uint256 indexed orderId);
    event OrderDecrypted(uint256 indexed orderId, uint256 amount);
    
    modifier validPair(uint256 _pairId) {
        require(_pairId < pairCounter && tradingPairs[_pairId].active, "Invalid trading pair");
        _;
    }
    
    modifier validOrder(uint256 _orderId) {
        require(_orderId < orderCounter && orders[_orderId].trader != address(0), "Invalid order");
        _;
    }
    
    modifier onlyOrderCreator(uint256 _orderId) {
        require(orders[_orderId].trader == msg.sender, "Only order creator can call this function");
        _;
    }
    
    constructor() {
        feeRecipient = msg.sender;
        
        // Create ETH/USDT pair
        _createTradingPair(address(0), address(0x1234567890123456789012345678901234567890), "ETH", "USDT");
        
        // Create ETH/USDC pair  
        _createTradingPair(address(0), address(0x2345678901234567890123456789012345678901), "ETH", "USDC");
        
        // Create ETH/DAI pair
        _createTradingPair(address(0), address(0x3456789012345678901234567890123456789012), "ETH", "DAI");
    }
    
    function _createTradingPair(address _tokenA, address _tokenB, string memory _symbolA, string memory _symbolB) internal {
        tradingPairs[pairCounter] = TradingPair({
            tokenA: _tokenA,
            tokenB: _tokenB,
            symbolA: _symbolA,
            symbolB: _symbolB,
            active: true,
            totalVolume: 0,
            lastPrice: 0
        });
        
        emit TradingPairCreated(pairCounter, _tokenA, _tokenB, _symbolA, _symbolB);
        pairCounter++;
    }
    
    function createTradingPair(address _tokenA, address _tokenB, string memory _symbolA, string memory _symbolB) 
        external 
        returns (uint256) 
    {
        require(_tokenA != _tokenB, "Tokens must be different");
        require(bytes(_symbolA).length > 0 && bytes(_symbolB).length > 0, "Symbols cannot be empty");
        
        _createTradingPair(_tokenA, _tokenB, _symbolA, _symbolB);
        return pairCounter - 1;
    }
    
    function createBuyOrder(
        uint256 _pairId,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external payable validPair(_pairId) returns (uint256) {
        require(_amountIn > 0, "Amount must be greater than 0");
        require(msg.value >= _amountIn, "Insufficient ETH sent");
        
        TradingPair memory pair = tradingPairs[_pairId];
        require(pair.tokenA == address(0), "This pair doesn't support ETH buy orders");
        
        orders[orderCounter] = Order({
            id: orderCounter,
            trader: msg.sender,
            tokenIn: pair.tokenA,
            tokenOut: pair.tokenB,
            amountIn: _amountIn,
            minAmountOut: _minAmountOut,
            isBuyOrder: true,
            status: OrderStatus.Active,
            timestamp: block.timestamp,
            isPrivate: false,
            filledAmount: 0,
            decryptedAmount: _amountIn
        });
        
        userOrders[msg.sender].push(orderCounter);
        
        emit OrderCreated(orderCounter, msg.sender, pair.tokenA, pair.tokenB, _amountIn, false);
        
        return orderCounter++;
    }
    
    function createSellOrder(
        uint256 _pairId,
        uint256 _amountIn,
        uint256 _minAmountOut,
        address _tokenIn
    ) external validPair(_pairId) returns (uint256) {
        require(_amountIn > 0, "Amount must be greater than 0");
        
        TradingPair memory pair = tradingPairs[_pairId];
        require(_tokenIn == pair.tokenA || _tokenIn == pair.tokenB, "Invalid token for this pair");
        
        if (_tokenIn != address(0)) {
            IERC20 token = IERC20(_tokenIn);
            require(token.transferFrom(msg.sender, address(this), _amountIn), "Token transfer failed");
        }
        
        address tokenOut = (_tokenIn == pair.tokenA) ? pair.tokenB : pair.tokenA;
        
        orders[orderCounter] = Order({
            id: orderCounter,
            trader: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: tokenOut,
            amountIn: _amountIn,
            minAmountOut: _minAmountOut,
            isBuyOrder: false,
            status: OrderStatus.Active,
            timestamp: block.timestamp,
            isPrivate: false,
            filledAmount: 0,
            decryptedAmount: _amountIn
        });
        
        userOrders[msg.sender].push(orderCounter);
        
        emit OrderCreated(orderCounter, msg.sender, _tokenIn, tokenOut, _amountIn, false);
        
        return orderCounter++;
    }
    
    function createPrivateBuyOrder(
        uint256 _pairId,
        externalEuint64 _encryptedAmount,
        bytes memory _inputProof,
        uint256 _minAmountOut
    ) external payable validPair(_pairId) returns (uint256) {
        require(msg.value > 0, "Must send ETH for private order");
        
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        encryptedOrderAmounts[orderCounter] = encryptedAmount;
        
        FHE.allowThis(encryptedOrderAmounts[orderCounter]);
        FHE.allow(encryptedOrderAmounts[orderCounter], msg.sender);
        
        TradingPair memory pair = tradingPairs[_pairId];
        
        orders[orderCounter] = Order({
            id: orderCounter,
            trader: msg.sender,
            tokenIn: pair.tokenA,
            tokenOut: pair.tokenB,
            amountIn: msg.value,
            minAmountOut: _minAmountOut,
            isBuyOrder: true,
            status: OrderStatus.Active,
            timestamp: block.timestamp,
            isPrivate: true,
            filledAmount: 0,
            decryptedAmount: 0
        });
        
        userOrders[msg.sender].push(orderCounter);
        
        emit OrderCreated(orderCounter, msg.sender, pair.tokenA, pair.tokenB, 0, true);
        
        return orderCounter++;
    }
    
    function matchOrders(uint256 _buyOrderId, uint256 _sellOrderId) 
        external 
        validOrder(_buyOrderId) 
        validOrder(_sellOrderId) 
    {
        Order storage buyOrder = orders[_buyOrderId];
        Order storage sellOrder = orders[_sellOrderId];
        
        require(buyOrder.isBuyOrder && !sellOrder.isBuyOrder, "Invalid order types");
        require(buyOrder.status == OrderStatus.Active && sellOrder.status == OrderStatus.Active, "Orders not active");
        require(buyOrder.tokenOut == sellOrder.tokenIn && buyOrder.tokenIn == sellOrder.tokenOut, "Token mismatch");
        
        uint256 buyAmount = buyOrder.amountIn - buyOrder.filledAmount;
        uint256 sellAmount = sellOrder.amountIn - sellOrder.filledAmount;
        uint256 tradeAmount = (buyAmount < sellAmount) ? buyAmount : sellAmount;
        
        require(tradeAmount > 0, "No tradeable amount");
        
        // Calculate exchange rate and amounts
        uint256 exchangeRate = (sellOrder.minAmountOut * 1e18) / sellOrder.amountIn;
        uint256 buyerReceives = (tradeAmount * 1e18) / exchangeRate;
        
        require(buyerReceives >= buyOrder.minAmountOut, "Price too high for buyer");
        
        // Calculate fees
        uint256 fee = (tradeAmount * FEE_RATE) / 10000;
        uint256 netAmount = tradeAmount - fee;
        
        // Update order states
        buyOrder.filledAmount += tradeAmount;
        sellOrder.filledAmount += buyerReceives;
        
        if (buyOrder.filledAmount >= buyOrder.amountIn) {
            buyOrder.status = OrderStatus.Filled;
        } else {
            buyOrder.status = OrderStatus.PartiallyFilled;
        }
        
        if (sellOrder.filledAmount >= sellOrder.amountIn) {
            sellOrder.status = OrderStatus.Filled;
        } else {
            sellOrder.status = OrderStatus.PartiallyFilled;
        }
        
        // Execute transfers
        if (sellOrder.tokenIn == address(0)) {
            payable(buyOrder.trader).transfer(buyerReceives);
        } else {
            IERC20(sellOrder.tokenIn).transfer(buyOrder.trader, buyerReceives);
        }
        
        if (buyOrder.tokenIn == address(0)) {
            payable(sellOrder.trader).transfer(netAmount);
        } else {
            IERC20(buyOrder.tokenIn).transfer(sellOrder.trader, netAmount);
        }
        
        // Send fee to recipient
        if (buyOrder.tokenIn == address(0)) {
            payable(feeRecipient).transfer(fee);
        }
        
        // Record trade
        trades.push(Trade({
            orderId1: _buyOrderId,
            orderId2: _sellOrderId,
            tokenA: buyOrder.tokenIn,
            tokenB: buyOrder.tokenOut,
            amountA: tradeAmount,
            amountB: buyerReceives,
            timestamp: block.timestamp,
            isPrivateTrade: buyOrder.isPrivate || sellOrder.isPrivate
        }));
        
        emit TradeExecuted(tradeCounter, buyOrder.tokenIn, buyOrder.tokenOut, tradeAmount, buyerReceives);
        emit OrderFilled(_buyOrderId, tradeAmount);
        emit OrderFilled(_sellOrderId, buyerReceives);
        
        tradeCounter++;
    }
    
    function cancelOrder(uint256 _orderId) external validOrder(_orderId) onlyOrderCreator(_orderId) {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Active || order.status == OrderStatus.PartiallyFilled, "Cannot cancel this order");
        
        uint256 refundAmount = order.amountIn - order.filledAmount;
        
        if (refundAmount > 0) {
            if (order.tokenIn == address(0)) {
                payable(order.trader).transfer(refundAmount);
            } else {
                IERC20(order.tokenIn).transfer(order.trader, refundAmount);
            }
        }
        
        order.status = OrderStatus.Cancelled;
        emit OrderCancelled(_orderId);
    }
    
    function requestOrderDecryption(uint256 _orderId) 
        external 
        validOrder(_orderId) 
        onlyOrderCreator(_orderId) 
    {
        Order storage order = orders[_orderId];
        require(order.isPrivate, "Order is not private");
        require(order.status != OrderStatus.DecryptionInProgress, "Decryption already in progress");
        
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(encryptedOrderAmounts[_orderId]);
        
        uint256 requestId = FHE.requestDecryption(
            cts, 
            this.callbackDecryptOrder.selector, 
            abi.encode(_orderId)
        );
        
        order.status = OrderStatus.DecryptionInProgress;
        emit DecryptionRequested(_orderId);
    }
    
    function callbackDecryptOrder(
        uint256 requestId, 
        uint64 amount, 
        bytes[] memory signatures
    ) external {
        FHE.checkSignatures(requestId, signatures);
        
        uint256 orderId = abi.decode(FHE.getRequestData(requestId), (uint256));
        orders[orderId].decryptedAmount = amount;
        orders[orderId].status = OrderStatus.ResultsDecrypted;
        
        emit OrderDecrypted(orderId, amount);
    }
    
    function getAllTradingPairs() external view returns (TradingPair[] memory) {
        TradingPair[] memory pairs = new TradingPair[](pairCounter);
        for (uint256 i = 0; i < pairCounter; i++) {
            pairs[i] = tradingPairs[i];
        }
        return pairs;
    }
    
    function getOrder(uint256 _orderId) external view validOrder(_orderId) returns (Order memory) {
        return orders[_orderId];
    }
    
    function getUserOrders(address _user) external view returns (uint256[] memory) {
        return userOrders[_user];
    }
    
    function getRecentTrades(uint256 _count) external view returns (Trade[] memory) {
        uint256 count = (_count > trades.length) ? trades.length : _count;
        Trade[] memory recentTrades = new Trade[](count);
        
        for (uint256 i = 0; i < count; i++) {
            recentTrades[i] = trades[trades.length - 1 - i];
        }
        
        return recentTrades;
    }
    
    function getEncryptedOrderAmount(uint256 _orderId) external view returns (euint64) {
        return encryptedOrderAmounts[_orderId];
    }
    
    function updateFeeRecipient(address _newRecipient) external {
        require(msg.sender == feeRecipient, "Only fee recipient can update");
        feeRecipient = _newRecipient;
    }
}