// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleCryptoVault is ReentrancyGuard, Ownable {
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

    enum ProjectStatus {
        Active,
        GoalReached,
        Expired,
        Cancelled
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public userContributionAmounts;
    mapping(address => uint256[]) public userProjects;
    mapping(address => uint256[]) public userContributions;
    
    uint256 public projectCounter;
    uint256 public platformFee = 250; // 2.5%
    address public feeCollector;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        uint256 fundingGoal,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount,
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

        userProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, _title, _fundingGoal, deadline);
        return projectId;
    }

    function contribute(uint256 _projectId) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Project does not exist");
        require(project.isActive, "Project is not active");
        require(block.timestamp < project.deadline, "Project deadline has passed");
        require(msg.value > 0, "Contribution must be greater than 0");
        
        // Update contribution tracking
        if (userContributionAmounts[_projectId][msg.sender] == 0) {
            project.contributorCount++;
        }
        userContributionAmounts[_projectId][msg.sender] += msg.value;
        project.totalRaised += msg.value;
        
        userContributions[msg.sender].push(_projectId);
        
        // Check if funding goal is reached
        if (project.totalRaised >= project.fundingGoal) {
            project.goalReached = true;
            emit ProjectFunded(_projectId, project.totalRaised);
        }
        
        emit ContributionMade(_projectId, msg.sender, msg.value, block.timestamp);
    }

    function withdrawFunds(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(project.creator == msg.sender, "Only project creator can withdraw");
        require(project.goalReached || block.timestamp >= project.deadline, "Cannot withdraw yet");
        require(project.isActive, "Project is not active");
        require(project.totalRaised > 0, "No funds to withdraw");
        
        project.isActive = false;
        uint256 amount = project.totalRaised;
        uint256 fee = (amount * platformFee) / 10000;
        uint256 netAmount = amount - fee;
        
        project.totalRaised = 0; // Prevent re-entrancy
        
        // Transfer funds
        (bool successCreator,) = payable(project.creator).call{value: netAmount}("");
        require(successCreator, "Transfer to creator failed");
        
        (bool successFee,) = payable(feeCollector).call{value: fee}("");
        require(successFee, "Fee transfer failed");
        
        emit FundsWithdrawn(_projectId, msg.sender, netAmount);
    }

    function claimRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(!project.goalReached, "Project was funded");
        require(block.timestamp >= project.deadline, "Project still active");
        
        uint256 refundAmount = userContributionAmounts[_projectId][msg.sender];
        require(refundAmount > 0, "No contribution found");
        
        userContributionAmounts[_projectId][msg.sender] = 0;
        project.totalRaised -= refundAmount;
        
        (bool success,) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundClaimed(_projectId, msg.sender, refundAmount);
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

    function getUserContributionAmount(uint256 _projectId, address _user) external view returns (uint256) {
        return userContributionAmounts[_projectId][_user];
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

    // Emergency withdraw for owner (only if something goes wrong)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }

    // Fallback functions
    receive() external payable {
        // Allow contract to receive ETH
    }
    
    fallback() external payable {
        // Allow contract to receive ETH
    }
}