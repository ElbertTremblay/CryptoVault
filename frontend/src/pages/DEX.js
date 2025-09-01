import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useFHE } from '../contexts/FHEContext';
import toast from 'react-hot-toast';
import {
  ArrowRightLeftIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DEX = () => {
  const { isConnected, account } = useWallet();
  const { isInitialized, createEncryptedInput, isMockMode } = useFHE();
  
  const [selectedTab, setSelectedTab] = useState('swap');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isSwapping, setIsSwapping] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: '2.45', price: 2400 },
    { symbol: 'USDC', name: 'USD Coin', balance: '1250.00', price: 1 },
    { symbol: 'USDT', name: 'Tether', balance: '890.50', price: 1 },
    { symbol: 'BTC', name: 'Bitcoin', balance: '0.125', price: 45000 },
    { symbol: 'UNI', name: 'Uniswap', balance: '45.80', price: 12.5 },
  ];

  const mockOrders = [
    {
      id: 1,
      type: 'buy',
      fromToken: 'ETH',
      toToken: 'USDC',
      amount: '***',
      price: 2400,
      status: 'pending',
      timestamp: new Date(Date.now() - 30000)
    },
    {
      id: 2,
      type: 'sell',
      fromToken: 'USDC',
      toToken: 'ETH',
      amount: '***',
      price: 2395,
      status: 'completed',
      timestamp: new Date(Date.now() - 300000)
    }
  ];

  useEffect(() => {
    setOrders(mockOrders);
  }, []);

  const calculateExchangeRate = () => {
    const fromTokenData = tokens.find(t => t.symbol === fromToken);
    const toTokenData = tokens.find(t => t.symbol === toToken);
    
    if (fromTokenData && toTokenData) {
      return fromTokenData.price / toTokenData.price;
    }
    return 1;
  };

  const handleAmountChange = (value, isFrom = true) => {
    if (isFrom) {
      setFromAmount(value);
      if (value) {
        const rate = calculateExchangeRate();
        setToAmount((parseFloat(value) * rate).toFixed(6));
      } else {
        setToAmount('');
      }
    } else {
      setToAmount(value);
      if (value) {
        const rate = calculateExchangeRate();
        setFromAmount((parseFloat(value) / rate).toFixed(6));
      } else {
        setFromAmount('');
      }
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSwapping(true);

    try {
      // Create encrypted input for the swap amount
      const encryptedInput = await createEncryptedInput(fromAmount);
      
      // Simulate MetaMask transaction confirmation
      const confirmed = window.confirm(
        `Confirm private swap of ${fromAmount} ${fromToken} for ~${toAmount} ${toToken}?\n\n` +
        `Your trading amounts will be encrypted and kept private.${isMockMode ? '\n\n(Demo Mode: No real transaction will be sent)' : ''}`
      );

      if (confirmed) {
        // Simulate transaction processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Add new order to history
        const newOrder = {
          id: Date.now(),
          type: 'swap',
          fromToken,
          toToken,
          amount: '***', // Encrypted amount
          price: calculateExchangeRate(),
          status: 'completed',
          timestamp: new Date()
        };
        
        setOrders([newOrder, ...orders]);
        setFromAmount('');
        setToAmount('');
        
        toast.success('Private swap completed successfully!');
      }
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleCreateOrder = async (orderType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const confirmed = window.confirm(
        `Create ${orderType} order for ${fromAmount} ${fromToken}?\n\n` +
        `Your order details will be encrypted and kept private.${isMockMode ? '\n\n(Demo Mode: No real order will be placed)' : ''}`
      );

      if (confirmed) {
        const newOrder = {
          id: Date.now(),
          type: orderType,
          fromToken,
          toToken,
          amount: '***',
          price: calculateExchangeRate(),
          status: 'pending',
          timestamp: new Date()
        };

        setOrders([newOrder, ...orders]);
        setFromAmount('');
        setToAmount('');
        setShowOrderModal(false);
        
        toast.success(`${orderType} order created successfully!`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Confidential DEX
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Trade tokens with complete privacy. Order sizes, balances, and trading history are encrypted using FHE.
          </p>
          
          {/* Privacy Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <EyeSlashIcon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">Private Orders</div>
              <div className="text-white/70 text-sm">Order amounts encrypted</div>
            </div>
            <div className="card text-center">
              <ArrowRightLeftIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">Instant Swaps</div>
              <div className="text-white/70 text-sm">Zero-knowledge trading</div>
            </div>
            <div className="card text-center">
              <ChartBarIcon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-lg font-semibold text-white">Hidden Analytics</div>
              <div className="text-white/70 text-sm">Private portfolio tracking</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              {/* Tab Navigation */}
              <div className="flex space-x-4 mb-6 border-b border-white/10 pb-4">
                <button
                  onClick={() => setSelectedTab('swap')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === 'swap' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setSelectedTab('limit')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === 'limit' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Limit Order
                </button>
              </div>

              {/* Swap Interface */}
              <div className="space-y-4">
                {/* From Token */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">From</label>
                  <div className="glass-effect p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <select
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                        className="bg-transparent text-white text-lg font-medium outline-none"
                      >
                        {tokens.map(token => (
                          <option key={token.symbol} value={token.symbol} className="bg-gray-800">
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => handleAmountChange(e.target.value, true)}
                        placeholder="0.0"
                        className="bg-transparent text-white text-right text-xl outline-none w-32"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-white/60">
                      <span>{tokens.find(t => t.symbol === fromToken)?.name}</span>
                      <span>Balance: {tokens.find(t => t.symbol === fromToken)?.balance}</span>
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSwapTokens}
                    className="p-2 glass-effect rounded-full hover:bg-white/20 transition-all"
                  >
                    <ArrowRightLeftIcon className="w-6 h-6 text-white transform rotate-90" />
                  </button>
                </div>

                {/* To Token */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">To</label>
                  <div className="glass-effect p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <select
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                        className="bg-transparent text-white text-lg font-medium outline-none"
                      >
                        {tokens.filter(t => t.symbol !== fromToken).map(token => (
                          <option key={token.symbol} value={token.symbol} className="bg-gray-800">
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={toAmount}
                        onChange={(e) => handleAmountChange(e.target.value, false)}
                        placeholder="0.0"
                        className="bg-transparent text-white text-right text-xl outline-none w-32"
                        readOnly={selectedTab === 'swap'}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-white/60">
                      <span>{tokens.find(t => t.symbol === toToken)?.name}</span>
                      <span>Balance: {tokens.find(t => t.symbol === toToken)?.balance}</span>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate & Slippage */}
                {fromAmount && toAmount && (
                  <div className="glass-effect p-4 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">Exchange Rate</span>
                      <span className="text-white">1 {fromToken} = {calculateExchangeRate().toFixed(6)} {toToken}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-white/70">Slippage Tolerance</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={slippage}
                          onChange={(e) => setSlippage(parseFloat(e.target.value))}
                          className="bg-white/10 text-white text-right w-16 px-2 py-1 rounded"
                          step="0.1"
                          min="0.1"
                          max="50"
                        />
                        <span className="text-white">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {selectedTab === 'swap' ? (
                    <button
                      onClick={handleSwap}
                      disabled={!isConnected || isSwapping || !fromAmount}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-50"
                    >
                      {isSwapping ? (
                        <div className="flex items-center justify-center">
                          <div className="spinner mr-3"></div>
                          Processing Private Swap...
                        </div>
                      ) : (
                        <>
                          <EyeSlashIcon className="w-5 h-5 mr-2" />
                          Swap Privately
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCreateOrder('buy')}
                        disabled={!isConnected || !fromAmount}
                        className="btn-accent py-4 disabled:opacity-50"
                      >
                        Create Buy Order
                      </button>
                      <button
                        onClick={() => handleCreateOrder('sell')}
                        disabled={!isConnected || !fromAmount}
                        className="btn-secondary py-4 disabled:opacity-50"
                      >
                        Create Sell Order
                      </button>
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="glass-effect p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center text-sm text-purple-300">
                    <EyeSlashIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      Your trading amounts are encrypted using FHE technology and remain completely private.
                      {isMockMode && ' (Demo Mode Active)'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Trading History
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="glass-effect p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.type === 'buy' ? 'bg-green-500/20 text-green-300' :
                        order.type === 'sell' ? 'bg-red-500/20 text-red-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {order.type.toUpperCase()}
                      </span>
                      <div className="flex items-center">
                        {order.status === 'completed' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        )}
                        <span className={`ml-1 text-xs ${
                          order.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-white font-medium mb-1">
                      {order.fromToken} → {order.toToken}
                    </div>
                    
                    <div className="flex justify-between text-sm text-white/70">
                      <span>Amount: {order.amount}</span>
                      <span>{formatTime(order.timestamp)}</span>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No trading history yet</p>
                    <p className="text-sm">Start trading to see your history</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Connect Wallet Notice */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <div className="glass-effect p-8 rounded-2xl max-w-md mx-auto">
              <CurrencyDollarIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-white/70 mb-4">
                Connect your wallet to start private trading on the DEX
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DEX;