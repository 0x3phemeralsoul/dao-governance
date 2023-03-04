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
const PCCBoss = new ethers.Contract(
  process.env.PCCBOSS_CONTRACT_ADDRESS,
  PCCBosscontractInterface,
  signer
);


// https://docs.ethers.io/v5/api/contract/contract
const NFT = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    NFTcontractInterface,
    signer
  );

async function main() {


    const latestBlock = await time.latestBlock();
    const votes = await PCCBoss.getVotes(process.env.MEMBER1_PUBLIC_KEY, latestBlock-1);
    console.log("Votes: ", votes);
    //console.log("NFT bakance on signer:", await NFT.balanceOf(process.env.MEMBER1_PUBLIC_KEY) )
    // Create proposal and get a proposalId in return
    const mintCalldata = NFT.interface.encodeFunctionData("mintNFT", [process.env.MEMBER_VOTED_PUBLIC_KEY] );
    console.log("mint call DATA: ---------", mintCalldata);
    const tx = await PCCBoss
        .connect(signer)
        .propose([process.env.NFT_CONTRACT_ADDRESS],[0],[mintCalldata],'Proposal #1: Mint membership');
    
    console.log("TX: ", tx);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
