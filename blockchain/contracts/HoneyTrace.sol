// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneyTrace
 * @notice Tamper-evident traceability records for honey batches.
 * Stores only batch ID, event type, cryptographic hash, timestamp, and recorder.
 * Full honey data remains off-chain in PostgreSQL.
 */
contract HoneyTrace {
    struct Record {
        bytes32 eventHash;
        uint256 timestamp;
        address recorder;
        bool exists;
    }

    // batchId => eventType => Record
    mapping(string => mapping(string => Record)) private records;

    event TraceabilityRecorded(
        string indexed batchId,
        string eventType,
        bytes32 eventHash,
        uint256 timestamp,
        address indexed recorder
    );

    function recordEvent(
        string calldata batchId,
        string calldata eventType,
        bytes32 eventHash
    ) external {
        require(!records[batchId][eventType].exists, "Event already recorded");
        require(eventHash != bytes32(0), "Invalid hash");

        records[batchId][eventType] = Record({
            eventHash: eventHash,
            timestamp: block.timestamp,
            recorder: msg.sender,
            exists: true
        });

        emit TraceabilityRecorded(batchId, eventType, eventHash, block.timestamp, msg.sender);
    }

    function getRecord(
        string calldata batchId,
        string calldata eventType
    ) external view returns (bytes32 eventHash, uint256 timestamp, address recorder) {
        Record memory r = records[batchId][eventType];
        require(r.exists, "Record not found");
        return (r.eventHash, r.timestamp, r.recorder);
    }

    function verifyRecord(
        string calldata batchId,
        string calldata eventType,
        bytes32 expectedHash
    ) external view returns (bool) {
        Record memory r = records[batchId][eventType];
        return r.exists && r.eventHash == expectedHash;
    }
}
