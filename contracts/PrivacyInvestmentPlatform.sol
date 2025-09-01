// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivacyInvestmentPlatform is SepoliaConfig {
    
    enum ProjectStatus {
        Active,
        Funded,
        Closed,
        DecryptionInProgress,
        ResultsDecrypted
    }
    
    struct Project {
        uint256 id;
        string title;
        string description;
        string imageHash;
        address creator;
        uint256 targetAmount;
        uint256 deadline;
        ProjectStatus status;
        bool exists;
        uint256 decryptedRaisedAmount;
        uint256 decryptedInvestorCount;
    }
    
    struct Investment {
        address investor;
        uint256 projectId;
        uint256 amount;
        uint256 timestamp;
        bool isPrivate;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => euint64) private encryptedRaisedAmounts;
    mapping(uint256 => euint64) private encryptedInvestorCounts;
    mapping(uint256 => mapping(address => euint64)) private encryptedUserInvestments;
    mapping(address => uint256[]) public userProjects;
    mapping(address => Investment[]) public userInvestments;
    
    uint256 public projectCounter;
    uint256 public totalProjects;
    
    event ProjectCreated(uint256 indexed projectId, address indexed creator, string title, uint256 targetAmount, uint256 deadline);
    event InvestmentMade(uint256 indexed projectId, address indexed investor, uint256 amount, bool isPrivate);
    event ProjectFunded(uint256 indexed projectId, uint256 totalRaised);
    event DecryptionRequested(uint256 indexed projectId);
    event ResultsDecrypted(uint256 indexed projectId, uint256 raisedAmount, uint256 investorCount);
    
    modifier projectExists(uint256 _projectId) {
        require(projects[_projectId].exists, "Project does not exist");
        _;
    }
    
    modifier onlyProjectCreator(uint256 _projectId) {
        require(projects[_projectId].creator == msg.sender, "Only project creator can call this function");
        _;
    }
    
    constructor() {
        projectCounter = 0;
        totalProjects = 0;
    }
    
    function createProject(
        string memory _title,
        string memory _description,
        string memory _imageHash,
        uint256 _targetAmount,
        uint256 _duration
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 projectId = projectCounter++;
        uint256 deadline = block.timestamp + _duration;
        
        projects[projectId] = Project({
            id: projectId,
            title: _title,
            description: _description,
            imageHash: _imageHash,
            creator: msg.sender,
            targetAmount: _targetAmount,
            deadline: deadline,
            status: ProjectStatus.Active,
            exists: true,
            decryptedRaisedAmount: 0,
            decryptedInvestorCount: 0
        });
        
        encryptedRaisedAmounts[projectId] = FHE.asEuint64(0);
        encryptedInvestorCounts[projectId] = FHE.asEuint64(0);
        
        FHE.allowThis(encryptedRaisedAmounts[projectId]);
        FHE.allowThis(encryptedInvestorCounts[projectId]);
        
        userProjects[msg.sender].push(projectId);
        totalProjects++;
        
        emit ProjectCreated(projectId, msg.sender, _title, _targetAmount, deadline);
        return projectId;
    }
    
    function investPublic(uint256 _projectId) external payable projectExists(_projectId) {
        require(msg.value > 0, "Investment amount must be greater than 0");
        require(block.timestamp <= projects[_projectId].deadline, "Project deadline has passed");
        require(projects[_projectId].status == ProjectStatus.Active, "Project is not active");
        
        projects[_projectId].decryptedRaisedAmount += msg.value;
        projects[_projectId].decryptedInvestorCount += 1;
        
        Investment memory investment = Investment({
            investor: msg.sender,
            projectId: _projectId,
            amount: msg.value,
            timestamp: block.timestamp,
            isPrivate: false
        });
        
        userInvestments[msg.sender].push(investment);
        
        emit InvestmentMade(_projectId, msg.sender, msg.value, false);
        
        if (projects[_projectId].decryptedRaisedAmount >= projects[_projectId].targetAmount) {
            projects[_projectId].status = ProjectStatus.Funded;
            emit ProjectFunded(_projectId, projects[_projectId].decryptedRaisedAmount);
        }
    }
    
    function investPrivate(uint256 _projectId, externalEuint64 _encryptedAmount, bytes memory _inputProof) 
        external 
        payable 
        projectExists(_projectId) 
    {
        require(msg.value > 0, "Must send ETH for private investment");
        require(block.timestamp <= projects[_projectId].deadline, "Project deadline has passed");
        require(projects[_projectId].status == ProjectStatus.Active, "Project is not active");
        
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        
        encryptedRaisedAmounts[_projectId] = FHE.add(encryptedRaisedAmounts[_projectId], encryptedAmount);
        encryptedInvestorCounts[_projectId] = FHE.add(encryptedInvestorCounts[_projectId], 1);
        encryptedUserInvestments[_projectId][msg.sender] = FHE.add(
            encryptedUserInvestments[_projectId][msg.sender], 
            encryptedAmount
        );
        
        FHE.allowThis(encryptedRaisedAmounts[_projectId]);
        FHE.allowThis(encryptedInvestorCounts[_projectId]);
        FHE.allowThis(encryptedUserInvestments[_projectId][msg.sender]);
        FHE.allow(encryptedUserInvestments[_projectId][msg.sender], msg.sender);
        
        Investment memory investment = Investment({
            investor: msg.sender,
            projectId: _projectId,
            amount: msg.value,
            timestamp: block.timestamp,
            isPrivate: true
        });
        
        userInvestments[msg.sender].push(investment);
        
        emit InvestmentMade(_projectId, msg.sender, 0, true);
    }
    
    function requestDecryption(uint256 _projectId) 
        external 
        projectExists(_projectId) 
        onlyProjectCreator(_projectId) 
    {
        require(
            block.timestamp > projects[_projectId].deadline || 
            projects[_projectId].status == ProjectStatus.Funded, 
            "Cannot decrypt before deadline or funding completion"
        );
        
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(encryptedRaisedAmounts[_projectId]);
        cts[1] = FHE.toBytes32(encryptedInvestorCounts[_projectId]);
        
        uint256 requestId = FHE.requestDecryption(
            cts, 
            this.callbackDecryptResults.selector, 
            abi.encode(_projectId)
        );
        
        projects[_projectId].status = ProjectStatus.DecryptionInProgress;
        emit DecryptionRequested(_projectId);
    }
    
    function callbackDecryptResults(
        uint256 requestId, 
        uint64 raisedAmount, 
        uint64 investorCount, 
        bytes[] memory signatures
    ) external {
        FHE.checkSignatures(requestId, signatures);
        
        uint256 projectId = abi.decode(FHE.getRequestData(requestId), (uint256));
        
        projects[projectId].decryptedRaisedAmount += raisedAmount;
        projects[projectId].decryptedInvestorCount += investorCount;
        projects[projectId].status = ProjectStatus.ResultsDecrypted;
        
        emit ResultsDecrypted(projectId, raisedAmount, investorCount);
    }
    
    function getProject(uint256 _projectId) external view projectExists(_projectId) returns (Project memory) {
        return projects[_projectId];
    }
    
    function getAllProjects() external view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](totalProjects);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < projectCounter; i++) {
            if (projects[i].exists) {
                allProjects[currentIndex] = projects[i];
                currentIndex++;
            }
        }
        
        return allProjects;
    }
    
    function getUserProjects(address _user) external view returns (uint256[] memory) {
        return userProjects[_user];
    }
    
    function getUserInvestments(address _user) external view returns (Investment[] memory) {
        return userInvestments[_user];
    }
    
    function getUserPrivateInvestment(uint256 _projectId, address _user) 
        external 
        view 
        returns (euint64) 
    {
        return encryptedUserInvestments[_projectId][_user];
    }
    
    function withdrawFunds(uint256 _projectId) 
        external 
        projectExists(_projectId) 
        onlyProjectCreator(_projectId) 
    {
        require(
            projects[_projectId].status == ProjectStatus.Funded || 
            projects[_projectId].status == ProjectStatus.ResultsDecrypted,
            "Project not ready for withdrawal"
        );
        
        uint256 totalAmount = projects[_projectId].decryptedRaisedAmount;
        require(totalAmount > 0, "No funds to withdraw");
        
        projects[_projectId].status = ProjectStatus.Closed;
        projects[_projectId].decryptedRaisedAmount = 0;
        
        payable(msg.sender).transfer(totalAmount);
    }
}