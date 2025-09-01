import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownLeft, FiShield, FiLock, FiUnlock, FiRefreshCw, FiBarChart3 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useWallet from '../hooks/useWallet';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TradingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TradingPairSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const PairButton = styled.button`
  padding: 12px 20px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const TradingInterface = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderTypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const OrderTypeButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.active ? (props.type === 'buy' ? 'linear-gradient(135deg, #2ed573 0%, #17a2b8 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)') : 'transparent'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const PrivacyToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ToggleSwitch = styled.div`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const PrivacyLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: ${props => props.type === 'buy' ? 'linear-gradient(135deg, #2ed573 0%, #17a2b8 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'};
  color: white;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.type === 'buy' ? 'rgba(46, 213, 115, 0.4)' : 'rgba(255, 107, 107, 0.4)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const OrderBookCard = styled(Card)`
  max-height: 600px;
  overflow-y: auto;
`;

const OrderBookHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
`;

const OrderBookHeaderItem = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
`;

const OrderBookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OrderBookItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding: 8px 0;
  font-size: 14px;
  
  &.buy {
    color: #2ed573;
  }
  
  &.sell {
    color: #ff6b6b;
  }
`;

const RecentTradesCard = styled(Card)`
  max-height: 400px;
  overflow-y: auto;
`;

const TradesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TradeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
`;

const TradePrice = styled.span`
  color: ${props => props.type === 'buy' ? '#2ed573' : '#ff6b6b'};
  font-weight: 600;
`;

const TradeAmount = styled.span`
  color: rgba(255, 255, 255, 0.8);
`;

const TradeTime = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 600;
`;

const StatValue = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 700;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PrivateDEX = () => {
  const { isConnected, account, signer } = useWallet();
  const [selectedPair, setSelectedPair] = useState('ETH/USDT');
  const [orderType, setOrderType] = useState('buy');
  const [isPrivateOrder, setIsPrivateOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    amount: '',
    price: '',
    total: ''
  });

  const [tradingPairs] = useState([
    { symbol: 'ETH/USDT', price: 2450.50, change: '+2.45%' },
    { symbol: 'ETH/USDC', price: 2451.20, change: '+2.51%' },
    { symbol: 'ETH/DAI', price: 2449.80, change: '+2.38%' }
  ]);

  const [orderBook] = useState({
    buys: [
      { price: 2450.50, amount: 5.2, total: 12743.26 },
      { price: 2449.80, amount: 3.8, total: 9309.24 },
      { price: 2449.00, amount: 2.1, total: 5142.90 },
      { price: 2448.50, amount: 1.5, total: 3672.75 },
      { price: 2448.00, amount: 0.8, total: 1958.40 }
    ],
    sells: [
      { price: 2451.20, amount: 2.3, total: 5637.76 },
      { price: 2451.80, amount: 4.1, total: 10052.38 },
      { price: 2452.50, amount: 1.9, total: 4659.75 },
      { price: 2453.00, amount: 3.2, total: 7849.60 },
      { price: 2454.20, amount: 2.7, total: 6626.34 }
    ]
  });

  const [recentTrades] = useState([
    { price: 2450.50, amount: 0.5, type: 'buy', time: '14:32:15' },
    { price: 2449.80, amount: 1.2, type: 'sell', time: '14:31:45' },
    { price: 2451.20, amount: 0.8, type: 'buy', time: '14:31:20' },
    { price: 2450.00, amount: 2.1, type: 'sell', time: '14:30:58' },
    { price: 2451.80, amount: 0.3, type: 'buy', time: '14:30:32' }
  ]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (!orderForm.amount || !orderForm.price) {
      toast.error('请输入有效的数量和价格');
      return;
    }

    setLoading(true);
    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${orderType === 'buy' ? '买入' : '卖出'}订单创建成功！`);
      setOrderForm({ amount: '', price: '', total: '' });
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('订单创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateTotal = () => {
    const amount = parseFloat(orderForm.amount) || 0;
    const price = parseFloat(orderForm.price) || 0;
    const total = amount * price;
    setOrderForm(prev => ({ ...prev, total: total.toFixed(6) }));
  };

  useEffect(() => {
    updateTotal();
  }, [orderForm.amount, orderForm.price]);

  const currentPair = tradingPairs.find(pair => pair.symbol === selectedPair);

  return (
    <Container>
      <Hero>
        <Title>私密去中心化交易所</Title>
        <Subtitle>
          基于 Zama FHE 技术的隐私保护去中心化交易平台，让您的交易金额和策略完全保密
        </Subtitle>
      </Hero>

      <MainContent>
        <TradingSection>
          {/* Trading Pairs */}
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TradingPairSelector>
              {tradingPairs.map((pair) => (
                <PairButton
                  key={pair.symbol}
                  active={selectedPair === pair.symbol}
                  onClick={() => setSelectedPair(pair.symbol)}
                >
                  {pair.symbol}
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                    {pair.change}
                  </span>
                </PairButton>
              ))}
            </TradingPairSelector>

            <StatsGrid>
              <StatItem>
                <StatLabel>价格</StatLabel>
                <StatValue>${currentPair?.price.toFixed(2)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>24h 变化</StatLabel>
                <StatValue style={{ color: '#2ed573' }}>{currentPair?.change}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>24h 高</StatLabel>
                <StatValue>$2,465.80</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>24h 低</StatLabel>
                <StatValue>$2,398.20</StatValue>
              </StatItem>
            </StatsGrid>
          </Card>

          {/* Trading Interface */}
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardTitle>
              <FiTrendingUp />
              交易面板
            </CardTitle>

            <TradingInterface>
              {/* Buy Panel */}
              <OrderPanel>
                <OrderTypeSelector>
                  <OrderTypeButton
                    type="buy"
                    active={orderType === 'buy'}
                    onClick={() => setOrderType('buy')}
                  >
                    <FiArrowUpRight />
                    买入
                  </OrderTypeButton>
                  <OrderTypeButton
                    type="sell"
                    active={orderType === 'sell'}
                    onClick={() => setOrderType('sell')}
                  >
                    <FiArrowDownLeft />
                    卖出
                  </OrderTypeButton>
                </OrderTypeSelector>

                <form onSubmit={handleOrderSubmit}>
                  <FormGroup>
                    <Label>价格 (USDT)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="输入价格"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>数量 (ETH)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="输入数量"
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>总价 (USDT)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="自动计算"
                      value={orderForm.total}
                      readOnly
                    />
                  </FormGroup>

                  <PrivacyToggle>
                    <ToggleSwitch
                      active={isPrivateOrder}
                      onClick={() => setIsPrivateOrder(!isPrivateOrder)}
                    />
                    <PrivacyLabel>
                      {isPrivateOrder ? <FiLock /> : <FiUnlock />}
                      私密交易 (FHE 加密)
                    </PrivacyLabel>
                  </PrivacyToggle>
                  
                  <ActionButton 
                    type="submit" 
                    orderType={orderType}
                    disabled={loading || !isConnected}
                  >
                    {loading ? <LoadingSpinner /> : (
                      <>
                        <FiShield />
                        {orderType === 'buy' ? '买入' : '卖出'} ETH
                      </>
                    )}
                  </ActionButton>
                </form>
              </OrderPanel>
            </TradingInterface>
          </Card>
        </TradingSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Book */}
          <OrderBookCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle>
              <FiBarChart3 />
              订单簿
            </CardTitle>
            
            <OrderBookHeader>
              <OrderBookHeaderItem>价格</OrderBookHeaderItem>
              <OrderBookHeaderItem>数量</OrderBookHeaderItem>
              <OrderBookHeaderItem>总价</OrderBookHeaderItem>
            </OrderBookHeader>

            <OrderBookList>
              {orderBook.sells.reverse().map((order, index) => (
                <OrderBookItem key={`sell-${index}`} className="sell">
                  <span>${order.price.toFixed(2)}</span>
                  <span>{order.amount.toFixed(3)}</span>
                  <span>${order.total.toFixed(2)}</span>
                </OrderBookItem>
              ))}
              
              <div style={{ 
                padding: '12px 0', 
                textAlign: 'center', 
                fontSize: '16px', 
                fontWeight: '700',
                color: '#667eea',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                margin: '8px 0'
              }}>
                ${currentPair?.price.toFixed(2)}
              </div>

              {orderBook.buys.map((order, index) => (
                <OrderBookItem key={`buy-${index}`} className="buy">
                  <span>${order.price.toFixed(2)}</span>
                  <span>{order.amount.toFixed(3)}</span>
                  <span>${order.total.toFixed(2)}</span>
                </OrderBookItem>
              ))}
            </OrderBookList>
          </OrderBookCard>

          {/* Recent Trades */}
          <RecentTradesCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CardTitle>
              <FiRefreshCw />
              最近交易
            </CardTitle>
            
            <TradesList>
              {recentTrades.map((trade, index) => (
                <TradeItem key={index}>
                  <TradePrice type={trade.type}>
                    ${trade.price.toFixed(2)}
                  </TradePrice>
                  <TradeAmount>
                    {trade.amount.toFixed(3)} ETH
                  </TradeAmount>
                  <TradeTime>
                    {trade.time}
                  </TradeTime>
                </TradeItem>
              ))}
            </TradesList>
          </RecentTradesCard>
        </div>
      </MainContent>
    </Container>
  );
};

export default PrivateDEX;