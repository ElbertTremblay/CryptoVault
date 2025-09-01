import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { FHEProvider } from './contexts/FHEContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Vault from './pages/Vault';
import DEX from './pages/DEX';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';

function App() {
  return (
    <WalletProvider>
      <FHEProvider>
        <div className="min-h-screen bg-primary-gradient">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/dex" element={<DEX />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateProject />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </FHEProvider>
    </WalletProvider>
  );
}

export default App;