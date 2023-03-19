require('dotenv').config();

const TimelockControllercontract = require("../../artifacts/@openzeppelin/contracts/governance/TimelockController.sol/TimelockController.json");
const TimelockControllercontractInterface = TimelockControllercontract.abi;
const PCCBosscontract = require("../../artifacts/contracts/PCCBoss.sol/PCCBoss.json");
const PCCBosscontractInterface = PCCBosscontract.abi;
const NFTcontract = require("../../artifacts/contracts/PCCMembershipNFT.sol/PCCMembershipNFT.json");
const NFTcontractInterface = NFTcontract.abi;

// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
let provider = ethers.provider;
const privateKey = `0x${process.env.DEPLOYER_PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey);

wallet.provider = provider;
const signer = wallet.connect(provider);


// https://docs.ethers.io/v5/api/contract/contract
const hardhatTimelockController = new ethers.Contract(
    process.env.BOSSMOM_CONTRACT_ADDRESS,
    TimelockControllercontractInterface,
    signer
  );

// https://docs.ethers.io/v5/api/contract/contract
const hardhatGovernor = new ethers.Contract(
  process.env.PCCBOSS_CONTRACT_ADDRESS,
  PCCBosscontractInterface,
  signer
);


// https://docs.ethers.io/v5/api/contract/contract
const hardhatToken = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    NFTcontractInterface,
    signer
  );

async function main() {

    //
    // PERMISSIONS
    //


     //set MyGovernor as proposer in hardhatGovernorTimelockControl
     await hardhatTimelockController.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")),hardhatGovernor.address );
     //set Executor to address(0) in hardhatGovernorTimelockControl
     await hardhatTimelockController.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")), ethers.constants.AddressZero);
     //set timeLockController admin to TimeLockController itself
     await hardhatTimelockController.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")), hardhatTimelockController.address);
     //admin(deployer) address to renounce admin on TimeLockController
     await hardhatTimelockController.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);
     await hardhatTimelockController.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);
     await hardhatTimelockController.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);    

    
    //set NFT roles to TimeLockController
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),hardhatTimelockController.address );


     // Admin, Minter, Uri and Burner renounceRole on NFT token

     await hardhatToken.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);
     await hardhatToken.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);
     await hardhatToken.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);
     await hardhatToken.renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")), process.env.DEPLOYER_PUBLIC_KEY);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
