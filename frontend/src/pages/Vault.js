import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useFHE } from '../contexts/FHEContext';
import toast from 'react-hot-toast';
import {
  EyeSlashIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Vault = () => {
  const { isConnected, account, signer } = useWallet();
  const { isInitialized, createEncryptedInput, isMockMode } = useFHE();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  // Mock projects data
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        title: 'DeFi Yield Optimizer',
        description: 'Advanced yield farming strategies with automated risk management and portfolio optimization.',
        category: 'DeFi',
        creator: '0x1234...5678',
        fundingGoal: '500',
        raised: '342',
        contributors: 127,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        image: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=DeFi+Project'
      },
      {
        id: 2,
        title: 'Privacy-Focused NFT Marketplace',
        description: 'Anonymous NFT trading platform with encrypted metadata and private collections.',
        category: 'NFT',
        creator: '0x9876...5432',
        fundingGoal: '750',
        raised: '456',
        contributors: 89,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        image: 'https://via.placeholder.com/400x200/f093fb/ffffff?text=NFT+Platform'
      },
      {
        id: 3,
        title: 'Quantum-Safe Wallet',
        description: 'Next-generation cryptocurrency wallet with quantum-resistant security features.',
        category: 'Security',
        creator: '0x5555...7777',
        fundingGoal: '1000',
        raised: '789',
        contributors: 234,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        image: 'https://via.placeholder.com/400x200/4facfe/ffffff?text=Secure+Wallet'
      }
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const diff = deadline - now;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} days left`;
  };

  const handleInvest = async (project) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isInitialized) {
      toast.error('FHE encryption not ready');
      return;
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    setIsInvesting(true);
    
    try {
      // Create encrypted input for the investment amount
      const encryptedInput = await createEncryptedInput(investmentAmount);
      
      // Simulate MetaMask transaction
      const tx = {
        to: '0x742d35Cc6e3FB4A4d4d2F8D9C3E5a4Ba7dC4C4E0', // Mock contract address
        value: investmentAmount,
        data: '0x' // Mock transaction data
      };

      // For demo purposes, show transaction confirmation
      const confirmed = window.confirm(
        `Confirm private investment of ${investmentAmount} ETH in "${project.title}"?\n\n` +
        `Your investment amount will be encrypted and kept private.${isMockMode ? '\n\n(Demo Mode: No real transaction will be sent)' : ''}`
      );

      if (confirmed) {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update project data
        const updatedProjects = projects.map(p => 
          p.id === project.id 
            ? { 
                ...p, 
                raised: (parseFloat(p.raised) + parseFloat(investmentAmount)).toFixed(2),
                contributors: p.contributors + 1 
              }
            : p
        );
        setProjects(updatedProjects);
        
        setInvestmentAmount('');
        setSelectedProject(null);
        
        toast.success('Private investment successful! Amount encrypted and transaction confirmed.');
      }
    } catch (error) {
      console.error('Investment error:', error);
      toast.error('Investment failed. Please try again.');
    } finally {
      setIsInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white/70">Loading private vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Private Investment Vault
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Invest in promising projects with complete privacy. Your contribution amounts are encrypted using FHE technology.
          </p>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <EyeSlashIcon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-white/70 text-sm">Investment Privacy</div>
            </div>
            <div className="card text-center">
              <ShieldCheckIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">256-bit</div>
              <div className="text-white/70 text-sm">FHE Encryption</div>
            </div>
            <div className="card text-center">
              <UsersIcon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <div className="text-white/70 text-sm">Active Projects</div>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card hover:scale-105 transform transition-all duration-300 group"
            >
              {/* Project Image */}
              <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚀</div>
                  <div className="text-white font-semibold">{project.category}</div>
                </div>
              </div>

              {/* Project Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                  <span>by {project.creator}</span>
                  <span className="bg-purple-500/20 px-2 py-1 rounded">{project.category}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{project.raised} ETH</span>
                  <span className="text-white/70 text-sm">of {project.fundingGoal} ETH</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(project.raised, project.fundingGoal)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-white/60">
                  <span className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    {project.contributors} contributors
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatTimeRemaining(project.deadline)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedProject(project)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
                disabled={!isConnected}
              >
                <EyeSlashIcon className="w-4 h-4" />
                <span>Private Invest</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Investment Modal */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect max-w-md w-full p-6 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Private Investment
                </h3>
                <p className="text-white/70 text-sm">
                  Your investment amount will be encrypted and kept completely private
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-2">{selectedProject.title}</h4>
                <div className="flex justify-between text-sm text-white/70">
                  <span>Raised: {selectedProject.raised} ETH</span>
                  <span>Goal: {selectedProject.fundingGoal} ETH</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Investment Amount (ETH)
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="0.1"
                  min="0"
                  step="0.01"
                  className="input-glass w-full"
                />
                <div className="flex items-center mt-2 text-xs text-white/60">
                  <EyeSlashIcon className="w-4 h-4 mr-1" />
                  <span>Amount will be encrypted using FHE {isMockMode && '(Demo Mode)'}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInvest(selectedProject)}
                  disabled={isInvesting || !investmentAmount}
                  className="flex-1 btn-primary"
                >
                  {isInvesting ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2" style={{width: '16px', height: '16px'}}></div>
                      Processing...
                    </div>
                  ) : (
                    'Invest Privately'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                Connect your wallet to start making private investments
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Vault;