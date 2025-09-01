import React from 'react';
import styled from 'styled-components';
import { FiWallet, FiLogOut, FiAlertTriangle } from 'react-icons/fi';
import useWallet from '../hooks/useWallet';

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ConnectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
`;

const AddressDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Address = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const Balance = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const NetworkWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid rgba(255, 165, 2, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffa502;
  font-size: 12px;
  font-weight: 600;
`;

const DisconnectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  
  &:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: rgba(255, 107, 107, 0.5);
  }
`;

const SwitchNetworkButton = styled.button`
  background: linear-gradient(135deg, #ffa502 0%, #ff7675 100%);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 2, 0.4);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const WalletConnection = () => {
  const {
    account,
    balance,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    formatAddress
  } = useWallet();

  if (isConnected) {
    return (
      <WalletContainer>
        {!isCorrectNetwork && (
          <NetworkWarning>
            <FiAlertTriangle />
            Wrong Network
            <SwitchNetworkButton onClick={switchToSepolia}>
              Switch to Sepolia
            </SwitchNetworkButton>
          </NetworkWarning>
        )}
        
        <WalletInfo>
          <FiWallet size={18} />
          <AddressDisplay>
            <Address>{formatAddress(account)}</Address>
            <Balance>{parseFloat(balance).toFixed(4)} ETH</Balance>
          </AddressDisplay>
        </WalletInfo>
        
        <DisconnectButton onClick={disconnectWallet} title="Disconnect Wallet">
          <FiLogOut size={16} />
        </DisconnectButton>
      </WalletContainer>
    );
  }

  return (
    <WalletContainer>
      <ConnectButton onClick={connectWallet} disabled={isConnecting}>
        {isConnecting ? (
          <>
            <LoadingSpinner />
            Connecting...
          </>
        ) : (
          <>
            <FiWallet size={18} />
            Connect Wallet
          </>
        )}
      </ConnectButton>
    </WalletContainer>
  );
};

export default WalletConnection;