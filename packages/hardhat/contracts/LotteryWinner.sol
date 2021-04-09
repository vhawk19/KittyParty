// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract KittyParty is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    struct AddressList {
        address[] array; // An unordered list of unique values
        mapping(address => bool) won;
        address[] possible_winners;
        mapping(address => bool) exists; // Tracks if a given value exists in the list
        mapping(address => uint256) index; // Tracks the index of a value
        mapping(address => uint256) balance; //Tracks the  pendingWithdrawals
    }
    // The member list keeps strack of all the memebers, their respective balances in the kitty party contract.
    // Members include the kittens + kitty kreator
    // The kitty kreator would be the first member in the list
    // The number of rounds in the kitty party hence would be equivalent to number of members - 1

    struct StakeInfo {
        uint256 kreatorSecurity;
        uint256 kittenPool;
    }

    enum KittyPartyState {
        Verification,
        Collection,
        Staking,
        Payout,
        Completed,
        Trap
    } //Set of valid states for the kitty party contract
    //Verification: The Pre-Round verification is ongoing
    //Collection: Pre-Round verification completed, collection criteria can be checked for
    //Staking: The colection has been completed successfully, the asset can now be staked on respective protocols
    //Payout: The assets are withdrawn from the repective contracts, a winner is chosen at random
    //Completed: THe kitty-party is over
    //Trap: INVALID STATE!!
    KittyPartyState currentState = KittyPartyState.Verification;
    //initial state is verification state

    uint256 public roundDuration; //Duration of round in days
    uint256 public amountPerRound; //Amount of eth to be pooled by the kittens
    uint256 public currentRound = 0; //Counter to keep track of the rounds
    bool public staked = false;
    address public winnerAddress;
    uint256 public amountWon;

    AddressList internal memberList;
    StakeInfo internal stakeDetail;

    event Deposit(address indexed _from, uint256 _value);

    event Withdraw(address indexed _to, uint256 _value);

    event Verified(bool verificationState, uint256 indexed roundNumber);

    event Completed(bool completedState);

    event CollectedFromKitten(
        address indexed kittenAddress,
        uint256 amount,
        uint256 roundNumber
    );

    event Staked(StakeInfo stakeDetails, uint256 roundNumber);

    event WithdrawnFromStaking(uint256 amount, uint256 roundNumber);

    event LotteryWinner(
        address indexed winner,
        uint256 amountWon,
        uint256 roundNumber
    );

    constructor()
        public
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709 // LINK Token
        )
    {
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10**18; // 0.1 LINK (varies by network)
    }

    function initialize(address[] memory memberAddress, uint256 _amountPerRound)
        public
    {
        for (uint256 i = 0; i < memberAddress.length; i++) {
            add(memberAddress[i]);
        }
        amountPerRound = _amountPerRound;
    }

    function add(address value) public returns (bool success) {
        // Only add 'value' if it does not exist in the list
        if (memberList.exists[value]) return false;

        memberList.index[value] = memberList.array.length;
        memberList.exists[value] = true;
        memberList.array.push(value);
        memberList.possible_winners.push(value);

        return true;
    }

    function getList() public view returns (address[] memory) {
        return memberList.array;
    }

    function getLength() public view returns (uint256) {
        return memberList.array.length;
    }

    function getValueAt(uint256 i) public view returns (address) {
        return memberList.array[i];
    }

    function getIndex(address ad) public view returns (uint256) {
        return memberList.index[ad];
    }

    function isKittyPartyActive() public returns (bool) {
        if (
            currentState == KittyPartyState.Trap ||
            currentState == KittyPartyState.Completed
        ) return false;
        return true;
    }

    function completeKittyParty() public {
        currentState = KittyPartyState.Completed;
    }

    function verify() public {
        require(
            memberList.balance[getValueAt(0)] >= amountPerRound,
            "Insufficient Funds, kindly top up the smart contract"
        );
        require(isKittyPartyActive(), "Kitty Party is not Active");
        if (currentRound == getLength()) {
            completeKittyParty();
        }
        currentState = KittyPartyState.Collection;
        emit Verified(true, currentRound);
    }

    function deposit() public payable {
        require(
            memberList.exists[msg.sender],
            "User not registered with the kitty party contract, kindly check with your kitty kreator"
        );
        memberList.balance[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        uint256 currentBalance = memberList.balance[msg.sender];
        require(amount <= currentBalance, "Insufficient Balance");
        memberList.balance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

    function withdrawAll() public {
        uint256 currentBalance = memberList.balance[msg.sender];
        memberList.balance[msg.sender] = 0;
        payable(msg.sender).transfer(currentBalance);
        emit Withdraw(msg.sender, currentBalance);
    }

    function collectFromKittens() public returns (uint256 amountCollected) {
        uint256 amountToBeCollectedFromKitten =
            amountPerRound / getLength() - 1;
        for (uint256 i = 1; i < getLength(); i++) {
            address kittenAddress = getValueAt(i);
            if (
                memberList.balance[kittenAddress] >=
                amountToBeCollectedFromKitten
            ) {
                amountCollected += amountToBeCollectedFromKitten;
                emit CollectedFromKitten(
                    kittenAddress,
                    amountCollected,
                    currentRound
                );
                memberList.balance[
                    kittenAddress
                ] -= amountToBeCollectedFromKitten;
            } else {
                amountCollected += memberList.balance[kittenAddress];
                emit CollectedFromKitten(
                    kittenAddress,
                    amountCollected,
                    currentRound
                );
                memberList.balance[kittenAddress] = 0;
            }
        }
        return amountCollected;
    }

    function collection() public {
        require(
            currentState == KittyPartyState.Collection,
            "Not in collection state"
        );
        stakeDetail.kittenPool = memberList.balance[getValueAt(0)];
        stakeDetail.kreatorSecurity = collectFromKittens();
        memberList.balance[getValueAt(0)] = 0;
        //stake(amountToBeStaked)
        emit Staked(stakeDetail, currentRound);
        currentState = KittyPartyState.Staking;
        staked = true;
    }

    function withdrawFromStaking() public {
        //call the lp contract, transfer the asset back to address(this)
        staked = false;
        //sendToPlatform
        emit WithdrawnFromStaking(amountWon, currentRound);
        if (stakeDetail.kittenPool > stakeDetail.kreatorSecurity) {
            //send .02*amountPerRound to platform
        } else {
            memberList.balance[getValueAt(0)] =
                (2 * amountPerRound) /
                100 +
                stakeDetail.kreatorSecurity;
        }
        amountWon -= ((2 * amountPerRound) / 100 + stakeDetail.kreatorSecurity);
        currentState = KittyPartyState.Payout;
    }

    function completeRound() internal {
        currentRound += 1;
    }

    function sendMoneyToWinner() public {
        memberList.balance[winnerAddress] += amountWon;
        memberList.won[winnerAddress] = true;
        delete memberList.possible_winners[getIndex(winnerAddress)];
        emit LotteryWinner(winnerAddress, amountWon, currentRound);
        completeRound();
    }

    function getRandomNumber(uint256 userProvidedSeed)
        public
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        uint256 winnerPoolLength = getLength() - currentRound;
        uint256 randomResult = (randomness % winnerPoolLength) + 1;
        winnerAddress = memberList.possible_winners[randomResult];
    }
}
