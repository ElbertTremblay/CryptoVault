// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

library FHEUtils {
    function encryptUint64(uint64 value) internal pure returns (euint64) {
        return FHE.asEuint64(value);
    }
    
    function addEncrypted(euint64 a, euint64 b) internal pure returns (euint64) {
        return FHE.add(a, b);
    }
    
    function subtractEncrypted(euint64 a, euint64 b) internal pure returns (euint64) {
        return FHE.sub(a, b);
    }
    
    function multiplyEncrypted(euint64 a, euint64 b) internal pure returns (euint64) {
        return FHE.mul(a, b);
    }
    
    function compareEncrypted(euint64 a, euint64 b) internal pure returns (ebool) {
        return FHE.gt(a, b);
    }
    
    function selectEncrypted(ebool condition, euint64 a, euint64 b) internal pure returns (euint64) {
        return FHE.select(condition, a, b);
    }
}

contract FHEOracle is ZamaConfig, Ownable {
    struct DecryptionRequest {
        address requester;
        bytes32 dataHash;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(address => bool) public authorizedCallers;
    
    uint256 public requestCounter;
    uint256 public constant DECRYPTION_DELAY = 1 hours;
    
    event DecryptionRequested(uint256 indexed requestId, address indexed requester, bytes32 dataHash);
    event DecryptionCompleted(uint256 indexed requestId, uint256 result);
    event AuthorizedCallerAdded(address indexed caller);
    event AuthorizedCallerRemoved(address indexed caller);
    
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        authorizedCallers[msg.sender] = true;
    }
    
    function requestDecryption(bytes32[] calldata ciphertext) external onlyAuthorized returns (uint256) {
        uint256 requestId = ++requestCounter;
        bytes32 dataHash = keccak256(abi.encodePacked(ciphertext));
        
        decryptionRequests[requestId] = DecryptionRequest({
            requester: msg.sender,
            dataHash: dataHash,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Request decryption through Zama's oracle
        FHE.requestDecryption(ciphertext, this.fulfillDecryption.selector);
        
        emit DecryptionRequested(requestId, msg.sender, dataHash);
        return requestId;
    }
    
    function fulfillDecryption(
        uint256 requestId,
        uint64 result,
        bytes[] memory signatures
    ) external {
        DecryptionRequest storage request = decryptionRequests[requestId];
        require(!request.completed, "Request already completed");
        require(block.timestamp >= request.timestamp + DECRYPTION_DELAY, "Decryption delay not met");
        
        // Verify signatures
        FHE.checkSignatures(requestId, signatures);
        
        request.completed = true;
        
        emit DecryptionCompleted(requestId, result);
    }
    
    function addAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
        emit AuthorizedCallerAdded(caller);
    }
    
    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
        emit AuthorizedCallerRemoved(caller);
    }
    
    function getDecryptionRequest(uint256 requestId) external view returns (DecryptionRequest memory) {
        return decryptionRequests[requestId];
    }
    
    function isAuthorized(address caller) external view returns (bool) {
        return authorizedCallers[caller];
    }
}