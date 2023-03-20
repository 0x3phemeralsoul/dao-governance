
# Installation
        
        npm install

## Configuration

Add an `.env` file matching the variables found in `hardhat.config.js`:
* INFURA_PROJECT_ID
* PRIVATE_KEY
* PUBLIC_KEY
* CONTRACT_ADDRESS

## Usage

### Deploy contract to Palm Testnet:
        
        npx hardhat run scripts/deploy.js --network palm_testnet

### Deploy contract to Palm Mainnet:

        npx hardhat run scripts/deploy.js --network palm_mainnet
        
### Mint NFT on Palm Testnet:

        npx hardhat run scripts/mint.js --network palm_testnet
        

### Mint NFT on Palm Mainnet:

        npx hardhat run scripts/mint.js --network palm_mainnet
        
# FEATURES

## NFT features
 - soulbound: cannot be transfered
 - Access control: Default Admin, Burner, Uri, Minter are passed to constructor
 - Only owner or burner can burn the token. This is to allow right to be forgotten to the owner and also allow for a DAO to kick out a soulbound member.
 - Only 1 token per address is allowed.
 - Uri role is able to update the tokenURI metadata.
 - On mint, delegate() is called from []ERC721Votes.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/token/ERC721/extensions/ERC721Votes.sol) so everytime we issue a membership, the voting power (1 vote, 1 member) is delegated to its holder automatically so the member can right away participate in on-chain governance without having to manually delegate to its own address which would be an extra UX friction for the member.


## Quest features
- The [Quest](./contracts/quest.sol) contract has MINTER_ROLE on the [PCCNFTmembership](./contracts/PCCMembershipNFT.sol) contract. This is set by the [deploy-set-roles](./scripts/Governance/deploy-set-roles.js) script. The MINTER_ROLE can be removed, in order to stop this quest, by an on-chain governance vote.

- Quest contract calls [Verifier](./contracts/verifier.sol) to validate that the answers to the quest are correct and hence mint the membership NFT to the recipient. The [Verifier](./contracts/verifier.sol) contract is created by using the Zokrates library which is a Zero Knowledge proof ZKSTARK implementation. More details on Zokrates and how to generate proofs as a user wanting to join the DAO (named Peggy in the instructions) can be found [here](./scripts/Zokrates/readme.md).

More quests, or other forms of issuing memberships, can be added to the DAO through on-chain governance.

## PCCBoss features

The [PCCBoss](./contracts/PCCBoss.sol) Contract is a [Governor OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/governance) instance.

### PALM Mainnet configuration
- Voting Delay: 1 block
- Voting Period: 1 week (120960 blocks) (blocktime 5 seconds)
- Proposal Threshold: 1 (1 vote, meaning, any member)
- Quorum: 30%
- ERC721Votes enabled.
- Non-upgradable: upgrades to be made through voting a new Governor through TimelockController.

### PALM Testnet configuration
- Voting Delay: 1 block
- Voting Period: 30 seconds (6 blocks) (blocktime 5 seconds)
- Proposal Threshold: 1 (1 vote, meaning, any member)
- Quorum: 1%
- ERC721Votes enabled.
- Non-upgradable: upgrades to be made through voting a new Governor through TimelockController.



# OFFICIAL DEPLOYMENTS


## PALM MAINNET

Use `mainnet` branch

### CONTRACTS
[PCCNFTmembership](./contracts/PCCMembershipNFT.sol) Contract deployed to address: 0x5FbDB2315678afecb367f032d93F642f64180aa3                                                                                
[TimelockController](./contracts/PCCBoss.sol) Contract deployed to address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512                                                                            
[PCCBoss](./contracts/PCCBoss.sol) (Governor OZ) Contract deployed to address: 
0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 

[Quest](./contracts/quest.sol) Contract deployed to address:


[Verifier](./contracts/verifier.sol) Contract deployed to address:

## PALM TESTNET 
Use `testnet` branch

### CONTRACTS

[PCCNFTmembership](./contracts/PCCMembershipNFT.sol) Contract deployed to address: 0x5FbDB2315678afecb367f032d93F642f64180aa3                                                                                
[TimelockController](./contracts/PCCBoss.sol) Contract deployed to address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512                                                                            
[PCCBoss](./contracts/PCCBoss.sol) (Governor OZ) Contract deployed to address: 
0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 

[Quest](./contracts/quest.sol) Contract deployed to address:


[Verifier](./contracts/verifier.sol) Contract deployed to address:

# OFF-CHAIN GOVERNANCE

## PALM Mainnet


## PALM Testnet