// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

// import "https://github.com/smartcontractkit/chainlink/blob/master/evm-contracts/src/v0.6/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract LotteryWinner is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;
    address public winnerAddress;
    
    
    
    struct AddressList {
        address[] array; // An unordered list of unique values
        mapping (address => bool) exists; // Tracks if a given value exists in the list
        mapping (address => uint) index; // Tracks the index of a value
    }
    
    AddressList internal memberList;
    
    constructor() 
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK Token
        ) public
    {
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10 ** 18; // 0.1 LINK (varies by network)
    }
    
    
        function add(address value) public returns (bool success) {
        // Only add 'value' if it does not exist in the list
        if(memberList.exists[value])
            return false;

        memberList.index[value] = memberList.array.length;
        memberList.exists[value] = true;
        memberList.array.push(value);

        return true;
    }

    function getList () public view returns (address[] memory) {
        return memberList.array;
    }
    
    function getLength () public view returns (uint) {
        return memberList.array.length;
    }

    function getValueAt ( uint i) public view returns (address) {
        return memberList.array[i];
    }
    
    /** 
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint lengthOfMembers = getLength()-1;
        randomResult = randomness.mod(lengthOfMembers).add(1);
        winnerAddress = getValueAt(randomResult);
    }
}