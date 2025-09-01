import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiShield, FiTrendingUp, FiLock } from 'react-icons/fi';
import WalletConnection from './WalletConnection';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  font-size: 24px;
  font-weight: 800;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    color: white;
    background: rgba(255, 255, 255, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      bottom: -16px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: #667eea;
      border-radius: 50%;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileNav = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(30, 60, 114, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-direction: column;
    padding: 16px;
    gap: 8px;
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>
            <FiShield size={24} />
          </LogoIcon>
          PrivateVault
        </Logo>

        <Navigation>
          <DesktopNav>
            <NavLink 
              to="/" 
              className={isActiveRoute('/') ? 'active' : ''}
            >
              <FiLock size={16} />
              投资平台
            </NavLink>
            <NavLink 
              to="/dex" 
              className={isActiveRoute('/dex') ? 'active' : ''}
            >
              <FiTrendingUp size={16} />
              私密DEX
            </NavLink>
          </DesktopNav>

          <MobileMenuButton onClick={toggleMobileMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </MobileMenuButton>
        </Navigation>

        <RightSection>
          <WalletConnection />
        </RightSection>
      </HeaderContent>

      <MobileNav isOpen={isMobileMenuOpen}>
        <NavLink 
          to="/" 
          className={isActiveRoute('/') ? 'active' : ''}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <FiLock size={16} />
          投资平台
        </NavLink>
        <NavLink 
          to="/dex" 
          className={isActiveRoute('/dex') ? 'active' : ''}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <FiTrendingUp size={16} />
          私密DEX
        </NavLink>
      </MobileNav>
    </HeaderContainer>
  );
};

export default Header;