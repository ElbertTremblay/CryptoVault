import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const techStack = [
    { name: 'Zama FHE', color: 'bg-purple-500' },
    { name: 'Ethereum', color: 'bg-blue-500' },
    { name: 'React', color: 'bg-cyan-500' },
    { name: 'Hardhat', color: 'bg-yellow-500' }
  ];

  const links = {
    product: [
      { name: 'Features', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'Roadmap', href: '#' },
      { name: 'Tokenomics', href: '#' }
    ],
    developers: [
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'GitHub', href: '#' },
      { name: 'Bug Bounty', href: '#' }
    ],
    community: [
      { name: 'Discord', href: '#' },
      { name: 'Twitter', href: '#' },
      { name: 'Telegram', href: '#' },
      { name: 'Medium', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Disclaimer', href: '#' }
    ]
  };

  return (
    <footer className="glass-effect mt-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-white font-bold text-xl">CryptoVault</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                The first confidential DeFi platform powered by Zama's Fully Homomorphic Encryption (FHE) protocol. 
                Experience true privacy in decentralized finance with encrypted investments and private trading.
              </p>
              
              {/* Tech Stack */}
              <div className="mb-6">
                <h4 className="text-white font-semibold text-sm mb-3">Powered by</h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, index) => (
                    <motion.span
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`${tech.color} text-white text-xs px-3 py-1 rounded-full font-medium`}
                    >
                      {tech.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(links).map(([category, items], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-white/70 hover:text-white text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/10 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-white/70 text-sm">
                © {currentYear} CryptoVault. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-xs">Testnet Active</span>
              </div>
              
              <a
                href="https://zama.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white text-xs transition-colors duration-200"
              >
                Built with ❤️ using Zama FHE
              </a>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 p-4 glass-effect rounded-lg border border-yellow-500/20"
        >
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-warning-gradient rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <div>
              <h4 className="text-yellow-400 font-semibold text-sm mb-1">Security Notice</h4>
              <p className="text-white/70 text-xs leading-relaxed">
                This is a demonstration platform running on testnet. Do not use real funds. 
                The FHE implementation is for educational purposes. Always verify smart contract addresses before interacting.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;