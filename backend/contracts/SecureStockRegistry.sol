// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureStockRecommendationRegistry
 * @dev Immutable ledger for recording and verifying stock recommendation integrity.
 * Stores minimal metadata (symbol, recommendation type, model version, timestamp)
 * along with the cryptographic SHA-256 hash of the complete analysis record.
 */
contract SecureStockRecommendationRegistry {
    address public owner;

    struct RecommendationRecord {
        string recId;
        string symbol;
        string recommendationType; // "BUY", "HOLD", "SELL"
        uint256 targetPriceCents;   // Price in cents ($125.50 -> 12550)
        string modelVersion;
        uint256 timestamp;
        bytes32 dataHash;
        address analyst;
        bool exists;
    }

    // Mapping from recommendation ID to on-chain record
    mapping(string => RecommendationRecord) private records;
    // Array of recorded IDs for discovery
    string[] public recordIds;

    event RecommendationRecorded(
        string indexed recId,
        string indexed symbol,
        string recommendationType,
        bytes32 dataHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record a new recommendation hash on the immutable ledger.
     */
    function recordRecommendation(
        string calldata recId,
        string calldata symbol,
        string calldata recommendationType,
        uint256 targetPriceCents,
        string calldata modelVersion,
        bytes32 dataHash
    ) external {
        require(!records[recId].exists, "Recommendation already recorded");

        records[recId] = RecommendationRecord({
            recId: recId,
            symbol: symbol,
            recommendationType: recommendationType,
            targetPriceCents: targetPriceCents,
            modelVersion: modelVersion,
            timestamp: block.timestamp,
            dataHash: dataHash,
            analyst: msg.sender,
            exists: true
        });

        recordIds.push(recId);

        emit RecommendationRecorded(recId, symbol, recommendationType, dataHash, block.timestamp);
    }

    /**
     * @dev Verify if a submitted recommendation hash matches the on-chain record.
     */
    function verifyRecommendation(string calldata recId, bytes32 expectedHash)
        external
        view
        returns (bool isValid, uint256 recordedTimestamp, address analyst)
    {
        RecommendationRecord memory rec = records[recId];
        require(rec.exists, "Record not found");
        return (rec.dataHash == expectedHash, rec.timestamp, rec.analyst);
    }

    /**
     * @dev Get on-chain recommendation record metadata.
     */
    function getRecord(string calldata recId)
        external
        view
        returns (
            string memory symbol,
            string memory recommendationType,
            uint256 targetPriceCents,
            string memory modelVersion,
            uint256 timestamp,
            bytes32 dataHash
        )
    {
        RecommendationRecord memory rec = records[recId];
        require(rec.exists, "Record not found");
        return (
            rec.symbol,
            rec.recommendationType,
            rec.targetPriceCents,
            rec.modelVersion,
            rec.timestamp,
            rec.dataHash
        );
    }

    /**
     * @dev Total number of recorded recommendations on-chain.
     */
    function totalRecords() external view returns (uint256) {
        return recordIds.length;
    }
}
