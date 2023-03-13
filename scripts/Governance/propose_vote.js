require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const PCCBosscontract = require("../artifacts/contracts/PCCBoss.sol/PCCBoss.json");
const PCCBosscontractInterface = PCCBosscontract.abi;
const NFTcontract = require("../artifacts/contracts/PCCMembershipNFT.sol/PCCMembershipNFT.json");
const NFTcontractInterface = NFTcontract.abi;

// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
let provider = ethers.provider;
const privateKey = `0x${process.env.MEMBER1_PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey);

wallet.provider = provider;
const signer = wallet.connect(provider);

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
      //Delegate to self
      //await hardhatToken.delegate(process.env.MEMBER1_PUBLIC_KEY)



    // Create proposal and get a proposalId in return
    const mintCalldata = hardhatToken.interface.encodeFunctionData("mintNFT", [process.env.MEMBER_VOTED_PUBLIC_KEY] );
    console.log("mint call DATA: ---------", mintCalldata);
    const tx = await hardhatGovernor
        .propose([process.env.NFT_CONTRACT_ADDRESS],[0],[mintCalldata],'Proposal #1: Mint membership');
    
    let receipt = await tx.wait();
    console.log("ProposalId: ", receipt.events[0].args.proposalId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
