// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CryptoVault is ZamaConfig, ReentrancyGuard, Ownable {
    struct Project {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        uint256 fundingGoal;
        uint256 deadline;
        bool isActive;
        bool goalReached;
        uint256 totalRaised;
        uint256 contributorCount;
    }

    struct PrivateContribution {
        address contributor;
        euint64 encryptedAmount;
        uint256 timestamp;
    }

    enum ProjectStatus {
        Active,
        GoalReached,
        Expired,
        Cancelled
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => PrivateContribution[]) public projectContributions;
    mapping(uint256 => euint64) private encryptedProjectTotals;
    mapping(address => uint256[]) public userProjects;
    mapping(address => uint256[]) public userContributions;
    
    uint256 public projectCounter;
    uint256 public platformFee = 250; // 2.5%
    address public feeCollector;
    
    uint256 private constant DECRYPTION_THRESHOLD = 10; // Minimum contributions before decryption

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        uint256 fundingGoal,
        uint256 deadline
    );
    
    event PrivateContributionMade(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 timestamp
    );
    
    event ProjectFunded(
        uint256 indexed projectId,
        uint256 totalRaised
    );
    
    event FundsWithdrawn(
        uint256 indexed projectId,
        address indexed creator,
        uint256 amount
    );
    
    event RefundClaimed(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {
        feeCollector = msg.sender;
    }

    function createProject(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _fundingGoal,
        uint256 _durationDays
    ) external nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");

        uint256 projectId = ++projectCounter;
        uint256 deadline = block.timestamp + (_durationDays * 1 days);

        projects[projectId] = Project({
            id: projectId,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            fundingGoal: _fundingGoal,
            deadline: deadline,
            isActive: true,
            goalReached: false,
            totalRaised: 0,
            contributorCount: 0
        });

        // Initialize encrypted total for this project
        encryptedProjectTotals[projectId] = FHE.asEuint64(0);
        FHE.allowThis(encryptedProjectTotals[projectId]);

        userProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, _title, _fundingGoal, deadline);
        return projectId;
    }

    function contributePrivately(
        uint256 _projectId,
        externalEuint64 _encryptedAmount,
        bytes calldata _inputProof
    ) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Project does not exist");
        require(project.isActive, "Project is not active");
        require(block.timestamp < project.deadline, "Project deadline has passed");
        require(msg.value > 0, "Contribution must be greater than 0");
        
        // Convert external encrypted value to internal
        euint64 encryptedAmount = FHE.fromExternal(_encryptedAmount, _inputProof);
        
        // Store the private contribution
        projectContributions[_projectId].push(PrivateContribution({
            contributor: msg.sender,
            encryptedAmount: encryptedAmount,
            timestamp: block.timestamp
        }));
        
        // Add to encrypted total
        encryptedProjectTotals[_projectId] = FHE.add(
            encryptedProjectTotals[_projectId], 
            encryptedAmount
        );
        FHE.allowThis(encryptedProjectTotals[_projectId]);
        
        // Update public metrics and track contribution amounts
        project.totalRaised += msg.value;
        if (userContributionAmounts[_projectId][msg.sender] == 0) {
            project.contributorCount++;
        }
        userContributionAmounts[_projectId][msg.sender] += msg.value;
        
        userContributions[msg.sender].push(_projectId);
        
        // Check if funding goal is reached
        if (project.totalRaised >= project.fundingGoal) {
            project.goalReached = true;
            emit ProjectFunded(_projectId, project.totalRaised);
        }
        
        emit PrivateContributionMade(_projectId, msg.sender, block.timestamp);
    }

    function withdrawFunds(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(project.creator == msg.sender, "Only project creator can withdraw");
        require(project.goalReached || block.timestamp >= project.deadline, "Cannot withdraw yet");
        require(project.isActive, "Project is not active");
        
        project.isActive = false;
        uint256 amount = project.totalRaised;
        uint256 fee = (amount * platformFee) / 10000;
        uint256 netAmount = amount - fee;
        
        // Transfer funds
        payable(project.creator).transfer(netAmount);
        payable(feeCollector).transfer(fee);
        
        emit FundsWithdrawn(_projectId, msg.sender, netAmount);
    }

    mapping(uint256 => mapping(address => uint256)) public userContributionAmounts;
    
    function claimRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(!project.goalReached, "Project was funded");
        require(block.timestamp >= project.deadline, "Project still active");
        
        uint256 refundAmount = userContributionAmounts[_projectId][msg.sender];
        require(refundAmount > 0, "No contribution found");
        
        userContributionAmounts[_projectId][msg.sender] = 0;
        payable(msg.sender).transfer(refundAmount);
        emit RefundClaimed(_projectId, msg.sender, refundAmount);
    }

    function requestDecryption(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(project.creator == msg.sender || msg.sender == owner(), "Unauthorized");
        require(project.contributorCount >= DECRYPTION_THRESHOLD, "Not enough contributions");
        
        // Request decryption of the total amount
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(encryptedProjectTotals[_projectId]);
        FHE.requestDecryption(cts, this.callbackDecryption.selector);
    }

    function callbackDecryption(
        uint256 /*requestId*/,
        uint64 decryptedTotal,
        bytes[] memory signatures
    ) public {
        // Note: In production, you'd need to properly handle the callback
        // and update the specific project's decrypted total
        FHE.checkSignatures(0, signatures); // Simplified signature check
        
        // This callback would update the project's decrypted total
        // Implementation depends on how you track which project requested decryption
    }

    // View functions
    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    function getProjectStatus(uint256 _projectId) external view returns (ProjectStatus) {
        Project memory project = projects[_projectId];
        
        if (!project.isActive) {
            return ProjectStatus.Cancelled;
        } else if (project.goalReached) {
            return ProjectStatus.GoalReached;
        } else if (block.timestamp >= project.deadline) {
            return ProjectStatus.Expired;
        } else {
            return ProjectStatus.Active;
        }
    }

    function getUserProjects(address _user) external view returns (uint256[] memory) {
        return userProjects[_user];
    }

    function getUserContributions(address _user) external view returns (uint256[] memory) {
        return userContributions[_user];
    }

    function getActiveProjects() external view returns (uint256[] memory) {
        uint256[] memory activeProjects = new uint256[](projectCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= projectCounter; i++) {
            if (projects[i].isActive && block.timestamp < projects[i].deadline) {
                activeProjects[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeProjects[i];
        }
        
        return result;
    }

    // Admin functions
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
    }

    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        feeCollector = _newCollector;
    }

    function emergencyPause(uint256 _projectId) external onlyOwner {
        projects[_projectId].isActive = false;
    }

    // Fallback functions
    receive() external payable {}
    fallback() external payable {}
}