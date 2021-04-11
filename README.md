# KittyParty
The first application on kurisan network

# Introduction

The Kitty Party app will be the first app on the kurisan network. The Kitty Party application will enable a group of people to pool resources into staking in a pool. It allows transactions in local currencies and this can be translated into an actual stake in crypto land in return for staking rewards or farming rewards. The rewards along with the original amount is returned to one lottery winner from the kitty pool.

![Kitty Party](https://i.ibb.co/2YgKfn1/kittyparty.jpg)

The staked value is bound to be minimal and will be mainly used to offset the fees that would be required to run the system by payment from the contract directly to different wallets. Any left over amounts will be distributed to the lottery winner.

## Development
- Use node 15.11.0
- `yarn install`
- Change keystore/KEYFILE.json and add a password file
- `cd packages/hardhat`
- `yarn deploy`
- In another terminal at root folder run `yarn start`
- Visit localhost:3000 to see the app
- See https://github.com/austintgriffith/scaffold-eth

## Main System Models: 
- Everyone will win at least once [To Do for Hackathon]
- Anyone can win without any gurantee; but you will reduce the chance of the person who won in a round already! 
- Bidding 


## Target Audience
Kitty Party focuses on a group of people with main target audience bringing in other people that has are not familiar or with little knowledge in Crypto. 
Main target audience: 18~50 years old, female or male who would like to introduce Crypto to their friends or family.

### User Persona
- One 22 year old college student wants to add her two cousins, one 31 and another 15 year old. She also managed to convince her mom's friend and her best friend. 
- Rico, 30 year-old man who is familiar with Cryptocurrency. He has a few friends from university that he would like to re-connect with. He needs a platform where he can invite his friends to do investment in Crypto and gain some profit. 

## System Design

### Actors

1. A kitten - A person who participates in the social contract

2. Kitty Kreator - A person who initiates the social contract

3. The kitty contract - A social smart contract that randomly picks one winner every round to send the kitty(pot of money to)

4. System contracts - Other contracts that allow for creation of the ecosystem and maintains various aspects of the application

### User Stories [TBC] // Need updated below

#### U1 Login

U1.1 As a user, I must be able to login via metamask.

U1.2 As a user, the app must ensure I am on the correct network

#### U2 Create Party with a Kitty

U2.1 As a Kitty Kreator I must be able to initiate a kitty party

U2.2 As a Kitty Kreator I need to define the rounds(12 months), duration (1 month), amount per round($120), number of people(12)

U2.3 As a Kitty Kreator I need to stake an amount that is equivalent to the amount of a single round contribution with one currency (ETH?)

U2.4 As a Kitty Kreator I need to be able to get back my stake at the end of 12 months

U2.5 As a creator I must be able to invite other kitties to my kitty party

U2.6 As a Kitty Kreator I can acknowledge off chain transaction recieved from a kitty

Additional Enhancement:

U2a.1 As a Kitty Kreator I can invite a kitty to kitty party

U2a.2 As a Kitty Kreator I should not be able to initiate the kitty party unless all invited kitties have completed the transactions

#### U3 participate and join a kitty party as a kitty

U3.1 _As a kitty in the party I must be able to contribute to the kitty by means of a off chain / on chain transaction to the kitty contract/creator._

U3.2 As a kitty I should be able to see my contribution

U3.3 As a kitty I should be able to claim my contribution in crypto/non crypto asset _Is this going to be kept on our side or transferred from the Kitty Kreator? Is it transferred directly to the wallet adddress?_

Additional Enhancement:

U3a.1 As a kitty I should be able to accept an invitation from a kitty party

#### U4 As the kitty contract I should be able to do a lottery

U4.1 As the contract using VRF I should be able to do a lottery and decide the winner.

U4.2 As the contract I should be able to make the transfer in terms of a stablecoin to the winning account

U4.3 As the contract I must be able to reduce some parameter for the winner so that the same person has a lower probability of winning next time in the next round

## Implementation

#### Development Toolset
In order to leverage on existing infrastructure we will use Polygon's layer 2 network and develop the application in solidity. As far as possible we will _avoid using backend_ systems.

Database
-> OrbitDB

Storage
-> IPFS

Frontend
-> React

#### Smart Contract Classes [TBC]
1. Kitty Contract with Random lottery picker
2. User Registration and DID
3. Reputation related claims
4. L2 Bridge related classes
5. Stablecoin convertor related assets

#### Oracle Functions

#### Security

##### Contract Safety

We will make the best use of the hackathon of which we are a part of and also once there is enough funds proportioned to test the security of our contracts we will do an external audit. Before that we will use various analysis software to make sure that we are as safe as possible.

##### Asset Security

For transferring assets for gas fees and such we will make use of a gnosis safe vault between the various early developers.


# User Workflow

## User Account (Login/Registration)
1. User can create an account via private key, MetaMask
2. User reaches dashboard with the list of Kitty Parties with different statuses.
   - PENDING: Party is created by the user as Kitty Kreator and waiting for Kitten's to complete the payments. Party is Pending action from Kitten  
   - STAKING: Party has started and the funds are used to be staked 
   - AT RISK: Party noted with lower total staking amount as a Kitten did not do any payment from previous round and total staking amount was used up.
   - HALTED: Party is closed due to no enough staking from the Kitty Kreator
   - ENDED: Party has ended :D
  

**Under Dashboard**:

-> As a Kitty Kreator, user can select an option to create a Kitty Party

-> As a Kitten, user can see the pending invites 


## Kitty Party - Main Flow

**Pre-requisite**: 
* Kitty Kreators and Kittens own a Crypto wallet
* Kittens should pass the address to Kitty Kreator in advance

1. Init Kitty Party; Kitty Kreator starts with basic setting:
   - Number of Kittens. This is done by specifying the kitten's addresses. This is essentially the **number of rounds**.
   - Stake Amount. This is the **total** amount per round: This amount will be divided equally for all Kittens.
   - Staking Duration. This is the time taken for the staking to be done. 
   - Waiting Time. This is the time given for all Kittens to do **payout** for Party Pending Invites.
  
  Note that on system, future enhancemnt can include settings:
  - User can tweak number of rounds, e.g. to do the party with 2x total of kittens.
  - QuickSwap Liquidity Pool can be dynamic. This allows users to select different keypairs.
  - Allow user to select different staking pool, not only QuickSwap.
  - Allow user to select rewarding system (see the Main System Models)
  
2. Kitty Kreator pass in at least the total stake amount for one round. 
   Kitty Kreator can **topup** with more than total stake amount for a Kitty Party. Why?
   - To let Kitty Kreator do the initial payment in behalf of other Kitten. **This is Kitten OFF CHAIN transaction support.** Note that Kitty Kreator MUST mark this transaction while doing topup. 
   - To increase the returns/profits in the party staking. 
   - To add insurance that Kitty Kreator can cover for any missing Kittens.

3. All kittens need to send the pending amount to be staked for one round on time. **This is Kitten ON CHAIN transaction support.**
   - Kitten must send correct amount within the specified **Waiting Time**
   - **MIA Kitten** = Kitten that is missing from 1 round. The Kitten fails to do payment within the Waiting Time. 
     - Kitty Kreator's funds will be deducted for this Kitten. The Kitten will be **excluded** for the rewarding system for this Round.
     - Kitty Kreator/Kitten can do payout/topup before the next round starts to keep the party going on. 
     - If Kitty Kreator/Kitten still fails to do the payment before next round starts, PARTY WILL BE HALTED.

4. Once all kittens sent out the pending amount. Contract validates total amount and initiates the staking (QuickSwap) for period of specified *total staking duration*

5. Once round duration expires, the earnings should be withdrawn from QuickSwap and rewards are given to: [REWARDING AMOUNT TBC]
   - "Random" Kitten of the Round - Keep the money from this Kitty [TBC]
   - Kitty Kreator
   - Small Fee to us
  
6. Before next round starts, ensure that Kitty Kreator has enough total stake amount.
   
7. If total stake amount is enough, round continues by repeating step 3~6 until the group period ends.



### Sample Scenario - MIA Kitten

Kitty Kreator, Total Stake Amount=$50
5 Kitten; $10 per kitten

**Round 1**
$50 + $40
1 Kitten MIA
**End of Round 1** 
Give out Rewards: 
--> Random kitten out of 4 -> [0] got the money
Do a Check: How much is the Kitty Kreator's Total Stake Amount? 
--> $40, which is not enough
Then:
- Give back to Kitty Kreator ($35), $5 as penalty fee
- Each Kitten will not be given anything 

**Round 2 will NOT start.**

Conclusion, HALTED PARTY conditions:
- Round is closing and completed
- Kitty Kreator has no enough total stake amount
