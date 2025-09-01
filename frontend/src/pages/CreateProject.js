import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  SparklesIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const CreateProject = () => {
  const { isConnected } = useWallet();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'DeFi',
    fundingGoal: '',
    duration: '30'
  });
  const [isCreating, setIsCreating] = useState(false);

  const categories = ['DeFi', 'NFT', 'Security', 'Gaming', 'Infrastructure', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.title || !formData.description || !formData.fundingGoal) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      // Simulate MetaMask transaction
      const confirmed = window.confirm(
        `Create new project "${formData.title}" with ${formData.fundingGoal} ETH funding goal?\n\n` +
        'This will create a smart contract for your project.'
      );

      if (confirmed) {
        // Simulate transaction processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        toast.success('Project created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'DeFi',
          fundingGoal: '',
          duration: '30'
        });
      }
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Create New Project
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Launch your fundraising campaign with complete privacy using FHE encryption
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your project title"
                className="input-glass w-full"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project, its goals, and why people should invest"
                className="input-glass w-full h-32 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-glass w-full"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Funding Goal (ETH) *
                </label>
                <input
                  type="number"
                  name="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={handleChange}
                  placeholder="100"
                  min="0.1"
                  step="0.1"
                  className="input-glass w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Campaign Duration (Days)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-glass w-full"
              >
                <option value="7" className="bg-gray-800">7 Days</option>
                <option value="14" className="bg-gray-800">14 Days</option>
                <option value="30" className="bg-gray-800">30 Days</option>
                <option value="60" className="bg-gray-800">60 Days</option>
                <option value="90" className="bg-gray-800">90 Days</option>
              </select>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-300 font-semibold mb-2">Privacy Features</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Investor amounts remain encrypted and private</li>
                <li>• Anonymous contribution tracking</li>
                <li>• Secure fund management with smart contracts</li>
                <li>• Private investor communications</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!isConnected || isCreating}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  Creating Project...
                </div>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Create Private Project
                </>
              )}
            </button>
          </form>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <div className="glass-effect p-8 rounded-2xl max-w-md mx-auto">
              <PlusIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-white/70 mb-4">
                Connect your wallet to create and manage projects
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreateProject;