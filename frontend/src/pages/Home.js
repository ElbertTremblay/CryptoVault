import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useFHE } from '../contexts/FHEContext';
import { 
  ShieldCheckIcon, 
  EyeSlashIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isConnected } = useWallet();
  const { isInitialized, isMockMode } = useFHE();
  const [stats, setStats] = useState({
    totalValueLocked: '0',
    activeProjects: '0',
    totalInvestments: '0',
    tradingVolume: '0'
  });

  const features = [
    {
      name: 'Fully Private Investments',
      description: 'Invest in projects without revealing your contribution amounts using advanced FHE encryption.',
      icon: EyeSlashIcon,
      color: 'from-purple-400 to-pink-400'
    },
    {
      name: 'Confidential DEX Trading',
      description: 'Trade tokens with complete privacy. Order sizes and balances remain encrypted and hidden.',
      icon: CurrencyDollarIcon,
      color: 'from-blue-400 to-cyan-400'
    },
    {
      name: 'Secure Project Funding',
      description: 'Launch fundraising campaigns with encrypted goal tracking and private backer information.',
      icon: ShieldCheckIcon,
      color: 'from-green-400 to-emerald-400'
    },
    {
      name: 'Advanced Analytics',
      description: 'Get insights from encrypted data without compromising individual privacy or sensitive information.',
      icon: ChartBarIcon,
      color: 'from-orange-400 to-red-400'
    },
    {
      name: 'Zero-Knowledge Proofs',
      description: 'Verify transactions and comply with regulations without revealing private financial data.',
      icon: LockClosedIcon,
      color: 'from-indigo-400 to-purple-400'
    },
    {
      name: 'Decentralized Governance',
      description: 'Participate in platform governance with private voting and encrypted proposal discussions.',
      icon: GlobeAltIcon,
      color: 'from-teal-400 to-blue-400'
    }
  ];

  const quickActions = [
    {
      title: 'Explore Private Vault',
      description: 'Discover confidential investment opportunities',
      href: '/vault',
      icon: EyeSlashIcon,
      gradient: 'bg-purple-gradient'
    },
    {
      title: 'Trade on Confidential DEX',
      description: 'Experience private decentralized trading',
      href: '/dex',
      icon: CurrencyDollarIcon,
      gradient: 'bg-accent-gradient'
    },
    {
      title: 'Create New Project',
      description: 'Launch your own fundraising campaign',
      href: '/create',
      icon: SparklesIcon,
      gradient: 'bg-secondary-gradient'
    }
  ];

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalValueLocked: '12.4M',
        activeProjects: '127',
        totalInvestments: '3,456',
        tradingVolume: '8.9M'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                The Future of{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Private DeFi
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience true financial privacy with CryptoVault's revolutionary FHE-powered platform. 
                Invest, trade, and fundraise without revealing sensitive financial information.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {isConnected ? (
                <>
                  <Link to="/vault" className="btn-primary text-lg px-8 py-4">
                    Explore Private Vault
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/dex" className="btn-outline text-lg px-8 py-4">
                    Trade on Confidential DEX
                  </Link>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <button className="btn-primary text-lg px-8 py-4">
                    Connect Wallet to Start
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </button>
                  <p className="text-white/60 text-sm">
                    Connect your wallet to access private DeFi features
                  </p>
                </div>
              )}
            </motion.div>

            {/* FHE Status Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full"
            >
              <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <span className="text-white/80 text-sm">
                {isInitialized 
                  ? `FHE Encryption ${isMockMode ? '(Demo Mode)' : 'Active'}` 
                  : 'Initializing FHE...'
                }
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {Object.entries(stats).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center card"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {value === '0' ? (
                    <div className="spinner mx-auto" style={{width: '20px', height: '20px'}}></div>
                  ) : (
                    value
                  )}
                </div>
                <div className="text-white/70 text-sm uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Privacy-First DeFi Features
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Built on Zama's cutting-edge Fully Homomorphic Encryption technology, 
              CryptoVault enables unprecedented privacy in decentralized finance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:scale-105 transform transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.name}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Choose your path to private DeFi and start experiencing true financial privacy today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className="block card hover:scale-105 transform transition-all duration-300 group"
                >
                  <div className={`w-16 h-16 ${action.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {action.description}
                  </p>
                  <div className="flex items-center text-purple-400 font-medium">
                    <span>Get Started</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;