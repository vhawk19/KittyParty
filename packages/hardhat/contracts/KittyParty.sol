// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Do not use this contract in production, safemath has not been added and is using a version prior to 0.8

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
        address stakeTokenAddress;
        uint256 noOfStakeTokens;
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
    
    address internal constant UNISWAP_ROUTER_ADDRESS = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff ;
    address internal constant UNISWAP_WETH_DAI_PAIR_ADDRESS = 0x4A35582a710E1F4b2030A3F826DA20BfB6703C09;
    address internal constant DAI_ADDRESS = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    IUniswapV2Router02 public uniswapRouter;
    IERC20 public dai;
    IERC20 public uni_token;

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
    
    event LotteryComplete(bytes32 requestId);
    
    event RoundCompleted(uint256 indexed roundNumber);
    constructor()
        public
        VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB // LINK Token
        )
    {
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10**18; // 0.1 LINK (varies by network)
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        dai = IERC20(DAI_ADDRESS);
        uni_token = IERC20(UNISWAP_WETH_DAI_PAIR_ADDRESS);
    }


//get the current status of the rounds
function getStatus() public view returns (KittyPartyState){
    return currentState;
}

//Used to initialize the contract, the minimal info required for the contract to function
// requires a list of member addresses, the first addres in the member list should be the address  of the kitty kreator
// the number of rounds would be memberlist length -1
// amount per round would be the amount per round
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
        memberList.balance[value] = 0;

        return true;
    }

    function getList() public view returns (address[] memory) {
        return memberList.array;
    }

    function getLength() public view returns (uint256) {
        return memberList.array.length - 1;
    }

    function getValueAt(uint256 i) public view returns (address) {
        return memberList.array[i];
    }

    function getIndex(address ad) public view returns (uint256) {
        return memberList.index[ad];
    }

    function isKittyKreator(address candidateKreator) public view  returns (bool) {
        if(
            getValueAt(0) == candidateKreator
            ) return true;
            return false;
    }

    function isKittyPartyActive() public view  returns (bool) {
        if (
            currentState == KittyPartyState.Trap ||
            currentState == KittyPartyState.Completed
        ) return false;
        return true;
    }
    
    function deposit() public payable {
        require(
            memberList.exists[msg.sender],
            "User not registered with the kitty party contract, kindly check with your kitty kreator"
        );
        memberList.balance[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function depositAmount(uint256 amount) public payable {
        require(
            memberList.exists[msg.sender],
            "User not registered with the kitty party contract, kindly check with your kitty kreator"
        );
        memberList.balance[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    function depositAmountOnBehalfOfKitten(uint256 amount, address kitten) public payable {        
        require(
            isKittyKreator(msg.sender),
            "You need to be the kitty kreator to deposit on behalf of a kitten"
        );
        memberList.balance[kitten] += amount;
        emit Deposit(kitten, amount);
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

    function collectFromKittens() public returns (uint256 amountCollected) {
        uint256 amountToBeCollectedFromKitten =
            amountPerRound / getLength();
        for (uint256 i = 1; i <= getLength(); i++) {
            address kittenAddress = getValueAt(i);
            if (
                memberList.balance[kittenAddress] >=
                amountToBeCollectedFromKitten
            ) {
                amountCollected += amountToBeCollectedFromKitten;
                memberList.balance[
                    kittenAddress
                ] -= amountToBeCollectedFromKitten;
                emit CollectedFromKitten(
                    kittenAddress,
                    amountCollected,
                    currentRound
                );
            } else {
                amountCollected += memberList.balance[kittenAddress];
                memberList.balance[kittenAddress] = 0;
                emit CollectedFromKitten(
                    kittenAddress,
                    amountCollected,
                    currentRound
                );
            }
        }
        return amountCollected;
    }

    function collection() public {
        require(
            currentState == KittyPartyState.Collection,
            "Not in collection state"
        );
        stakeDetail.kittenPool = amountPerRound;
        stakeDetail.kreatorSecurity = collectFromKittens();
        stakeDetail.stakeTokenAddress = UNISWAP_WETH_DAI_PAIR_ADDRESS;
        memberList.balance[getValueAt(0)] = memberList.balance[getValueAt(0)] - amountPerRound;
        stakeDetail.noOfStakeTokens = addLiquidityFromEth(stakeDetail.kittenPool + stakeDetail.kreatorSecurity);
        emit Staked(stakeDetail, currentRound);
        currentState = KittyPartyState.Staking;
        staked = true;
    }

    function withdrawFromStaking() public {
        //call the lp contract, transfer the asset back to address(this)
        amountWon = removeLiquidityFromEth(stakeDetail.noOfStakeTokens);
        staked = false;
        //sendToPlatform
        emit WithdrawnFromStaking(amountWon, currentRound);
        if (stakeDetail.kittenPool > stakeDetail.kreatorSecurity) {
            //send .02*amountPerRound to platform
        } else {
            memberList.balance[getValueAt(0)] = 102 * amountPerRound/100;
        }
        amountWon -= 102 * amountPerRound/100;
        currentState = KittyPartyState.Payout;
        runLottery(now);
    }

    function completeRound() internal {
        emit RoundCompleted(currentRound);
        currentRound += 1;
    }

    function sendMoneyToWinner() public {
        memberList.balance[winnerAddress] += amountWon;
        memberList.won[winnerAddress] = true;
        delete memberList.possible_winners[getIndex(winnerAddress)];
        emit LotteryWinner(winnerAddress, amountWon, currentRound);
        completeRound();
    }

    function runLottery(uint256 userProvidedSeed)
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
        emit LotteryComplete(requestId);
        sendMoneyToWinner();
    }
    
    function getBalance(address ad) public view returns(uint256){
        return memberList.balance[ad];
    }
    
    function addLiquidityFromEth(uint ethAmountIn) public returns(uint) {
        uint ethAmount = ethAmountIn/2;
        uint daiAmount = convertEthToDai(ethAmount);
        require(dai.approve(address(uniswapRouter), daiAmount), 'approve failed.');
        uint amountToken;
        uint amountETH;
        uint liquidity;
        (amountToken, amountETH, liquidity) = uniswapRouter.addLiquidityETH{value: ethAmount}(DAI_ADDRESS, daiAmount,
        daiAmount - 5000000000000000, ethAmount - 100000000000000, address(this), block.timestamp + 15);
        return liquidity;
    }
    
    // TODO: amountTokenMin, amountETHMin, and find a way to keep track of Uni tokens per account
    // Automatically sends back ETH to user
    function removeLiquidityFromEth(uint uniAmountOut) public returns(uint) {
        require(uni_token.approve(address(uniswapRouter), uniAmountOut), 'approve failed.');
        uint amountDai;
        uint amountEth;
        (amountDai, amountEth) = uniswapRouter.removeLiquidityETH(DAI_ADDRESS, uniAmountOut, 0, 0, address(this), block.timestamp + 15);
        amountEth += convertDaiToEth(amountDai);
        msg.sender.transfer(amountEth);
        return amountEth;
    }
    
    // Assumes that contract already has Dai
    function addLiquidityFromDai(uint daiAmountIn) public {
        uint daiAmount = daiAmountIn/2;
        uint ethAmount = convertDaiToEth(daiAmount);
        require(dai.approve(address(uniswapRouter), daiAmount), 'approve failed.');
        uniswapRouter.addLiquidityETH{ value: ethAmount }(DAI_ADDRESS, daiAmount,
        daiAmount - 5000000000000000, ethAmount, address(this), block.timestamp + 15);
    }
    
    // TODO: amountTokenMin, amountETHMin, and find a way to keep track of Uni tokens per account
    // NOTE: Does NOT automatically send back DAI to user
    function removeLiquidityFromDai(uint uniAmountOut) public {
        require(uni_token.approve(address(uniswapRouter), uniAmountOut), 'approve failed.');
        uint amountDai;
        uint amountEth;
        (amountDai, amountEth) = uniswapRouter.removeLiquidityETH(DAI_ADDRESS, uniAmountOut, 0, 0, address(this), block.timestamp + 15);
        amountDai += convertEthToDai(amountEth);
    }
    
    function convertDaiToEth(uint daiAmount) private returns(uint) {
        // amountOutMin must be retrieved from an oracle of some kind
        uint amountOutMin = getEstimatedETHforDAI(daiAmount)[1];
        require(dai.approve(address(uniswapRouter), daiAmount), 'approve failed.');
        uniswapRouter.swapExactTokensForETH(daiAmount, amountOutMin, getPathForDAItoETH(), address(this), block.timestamp);
        return amountOutMin;
    }
    
    function convertEthToDai(uint ethAmount) private returns(uint) {
        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        uint amountDai = getEstimatedDAIforETH(ethAmount)[1];
        uniswapRouter.swapETHForExactTokens{ value: ethAmount }(amountDai, getPathForETHtoDAI(), address(this), deadline);
        return amountDai;
        // refund leftover ETH to user
        // (bool success,) = msg.sender.call{ value: address(this).balance }("");
        // require(success, "refund failed");
    }
    
    function getEstimatedETHforDAI(uint daiAmount) public view returns (uint[] memory) {
        return uniswapRouter.getAmountsOut(daiAmount, getPathForDAItoETH());
    }
    
    function getEstimatedDAIforETH(uint ethAmount) public view returns (uint[] memory) {
        return uniswapRouter.getAmountsOut(ethAmount, getPathForETHtoDAI());
    }

    function getPathForETHtoDAI() private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = address(DAI_ADDRESS);
        return path;
    }
    
    function getPathForDAItoETH() private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = address(DAI_ADDRESS);
        path[1] = uniswapRouter.WETH();
        return path;
    }
    
    function checkDaiBalance() public view returns (uint256) {
         return dai.balanceOf(address(this));
    }
    
    function checkUniBalance() public view returns (uint256) {
         return uni_token.balanceOf(address(this));
    }
    
    // important to receive ETH
    receive() payable external {}
}