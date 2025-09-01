import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiEye, FiDollarSign, FiUsers, FiCalendar, FiTarget, FiShield, FiLock, FiUnlock } from 'react-icons/fi';
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

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const ProjectCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
`;

const ProjectContent = styled.div`
  padding: 24px;
`;

const ProjectTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
`;

const ProjectDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: white;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  width: ${props => props.percentage}%;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  &.secondary {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.active {
    background: rgba(46, 213, 115, 0.2);
    color: #2ed573;
    border: 1px solid rgba(46, 213, 115, 0.3);
  }
  
  &.funded {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.3);
  }
  
  &.closed {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(30, 60, 114, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: white;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const Input = styled.input`
  width: 100%;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
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

const InvestmentPlatform = () => {
  const { isConnected, account, signer } = useWallet();
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [investing, setInvesting] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    duration: '30',
    imageHash: 'QmDefaultImage'
  });

  const [investForm, setInvestForm] = useState({
    amount: '',
    isPrivate: false
  });

  // Mock project data for demo
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        title: "绿色能源项目",
        description: "开发可再生能源解决方案，为未来创造清洁能源基础设施。我们的目标是建设一个可持续的能源生态系统。",
        targetAmount: 100,
        raisedAmount: 45.5,
        investorCount: 23,
        deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
        status: 'active',
        creator: '0x123...abc',
        imageHash: 'QmGreenEnergy'
      },
      {
        id: 2,
        title: "AI 医疗诊断平台",
        description: "利用人工智能技术开发医疗诊断平台，提高疾病诊断的准确性和效率。",
        targetAmount: 200,
        raisedAmount: 200,
        investorCount: 87,
        deadline: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'funded',
        creator: '0x456...def',
        imageHash: 'QmAIMedical'
      },
      {
        id: 3,
        title: "区块链教育平台",
        description: "构建基于区块链的在线教育平台，为全球学习者提供去中心化的教育资源。",
        targetAmount: 150,
        raisedAmount: 89.3,
        investorCount: 34,
        deadline: Date.now() + 20 * 24 * 60 * 60 * 1000,
        status: 'active',
        creator: '0x789...ghi',
        imageHash: 'QmBlockchainEdu'
      }
    ];
    setProjects(mockProjects);
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    setCreating(true);
    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProject = {
        id: projects.length + 1,
        title: createForm.title,
        description: createForm.description,
        targetAmount: parseFloat(createForm.targetAmount),
        raisedAmount: 0,
        investorCount: 0,
        deadline: Date.now() + parseInt(createForm.duration) * 24 * 60 * 60 * 1000,
        status: 'active',
        creator: account,
        imageHash: createForm.imageHash
      };

      setProjects(prev => [newProject, ...prev]);
      setCreateForm({
        title: '',
        description: '',
        targetAmount: '',
        duration: '30',
        imageHash: 'QmDefaultImage'
      });
      setShowCreateModal(false);
      toast.success('项目创建成功！');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('项目创建失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (!investForm.amount || parseFloat(investForm.amount) <= 0) {
      toast.error('请输入有效的投资金额');
      return;
    }

    setInvesting(true);
    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amount = parseFloat(investForm.amount);
      setProjects(prev => prev.map(project => {
        if (project.id === selectedProject.id) {
          const newRaisedAmount = project.raisedAmount + amount;
          return {
            ...project,
            raisedAmount: newRaisedAmount,
            investorCount: project.investorCount + 1,
            status: newRaisedAmount >= project.targetAmount ? 'funded' : 'active'
          };
        }
        return project;
      }));

      setInvestForm({ amount: '', isPrivate: false });
      setShowInvestModal(false);
      toast.success(`成功投资 ${amount} ETH！`);
    } catch (error) {
      console.error('Error investing:', error);
      toast.error('投资失败，请重试');
    } finally {
      setInvesting(false);
    }
  };

  const formatTimeLeft = (deadline) => {
    const now = Date.now();
    const diff = deadline - now;
    
    if (diff <= 0) return '已结束';
    
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}天 ${hours}小时`;
    return `${hours}小时`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '进行中';
      case 'funded': return '已达标';
      case 'closed': return '已关闭';
      default: return status;
    }
  };

  return (
    <Container>
      <Hero>
        <Title>私密投资平台</Title>
        <Subtitle>
          基于 Zama FHE 技术的隐私保护投资平台，让您的投资金额和身份保持完全隐私
        </Subtitle>
      </Hero>

      <ActionButtons>
        <CreateButton onClick={() => setShowCreateModal(true)} disabled={!isConnected}>
          <FiPlus size={20} />
          创建项目
        </CreateButton>
      </ActionButtons>

      <ProjectGrid>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProjectImage>
              <StatusBadge className={project.status}>
                {getStatusText(project.status)}
              </StatusBadge>
              <FiTarget size={48} />
            </ProjectImage>
            
            <ProjectContent>
              <ProjectTitle>{project.title}</ProjectTitle>
              <ProjectDescription>{project.description}</ProjectDescription>
              
              <ProjectStats>
                <Stat>
                  <FiDollarSign size={16} />
                  目标: <StatValue>{project.targetAmount} ETH</StatValue>
                </Stat>
                <Stat>
                  <FiUsers size={16} />
                  投资者: <StatValue>{project.investorCount}</StatValue>
                </Stat>
                <Stat>
                  <FiCalendar size={16} />
                  剩余: <StatValue>{formatTimeLeft(project.deadline)}</StatValue>
                </Stat>
                <Stat>
                  <FiDollarSign size={16} />
                  已筹: <StatValue>{project.raisedAmount} ETH</StatValue>
                </Stat>
              </ProjectStats>
              
              <ProgressBar>
                <ProgressFill 
                  percentage={Math.min((project.raisedAmount / project.targetAmount) * 100, 100)}
                />
              </ProgressBar>
              
              <ProjectActions>
                <ActionButton 
                  className="primary"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowInvestModal(true);
                  }}
                  disabled={!isConnected || project.status !== 'active'}
                >
                  <FiDollarSign size={16} />
                  投资
                </ActionButton>
                <ActionButton className="secondary">
                  <FiEye size={16} />
                  详情
                </ActionButton>
              </ProjectActions>
            </ProjectContent>
          </ProjectCard>
        ))}
      </ProjectGrid>

      {/* Create Project Modal */}
      {showCreateModal && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <CloseButton onClick={() => setShowCreateModal(false)}>
              ✕
            </CloseButton>
            <ModalTitle>创建投资项目</ModalTitle>
            
            <form onSubmit={handleCreateProject}>
              <FormGroup>
                <Label>项目标题</Label>
                <Input
                  type="text"
                  placeholder="输入项目标题"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>项目描述</Label>
                <TextArea
                  placeholder="详细描述您的项目..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>目标金额 (ETH)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="例如: 100"
                  value={createForm.targetAmount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>筹款期限 (天)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="例如: 30"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <ModalActions>
                <ActionButton 
                  type="button" 
                  className="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </ActionButton>
                <ActionButton 
                  type="submit" 
                  className="primary"
                  disabled={creating}
                >
                  {creating ? <LoadingSpinner /> : '创建项目'}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Investment Modal */}
      {showInvestModal && selectedProject && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <CloseButton onClick={() => setShowInvestModal(false)}>
              ✕
            </CloseButton>
            <ModalTitle>投资项目: {selectedProject.title}</ModalTitle>
            
            <form onSubmit={handleInvest}>
              <FormGroup>
                <Label>投资金额 (ETH)</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="输入投资金额"
                  value={investForm.amount}
                  onChange={(e) => setInvestForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={investForm.isPrivate}
                    onChange={(e) => setInvestForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  />
                  {investForm.isPrivate ? <FiLock size={16} /> : <FiUnlock size={16} />}
                  私密投资 (使用 FHE 加密)
                </Label>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                  {investForm.isPrivate ? '您的投资金额将完全保密' : '您的投资金额将公开显示'}
                </p>
              </FormGroup>
              
              <ModalActions>
                <ActionButton 
                  type="button" 
                  className="secondary" 
                  onClick={() => setShowInvestModal(false)}
                >
                  取消
                </ActionButton>
                <ActionButton 
                  type="submit" 
                  className="primary"
                  disabled={investing}
                >
                  {investing ? <LoadingSpinner /> : (
                    <>
                      <FiShield size={16} />
                      确认投资
                    </>
                  )}
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default InvestmentPlatform;