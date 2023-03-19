require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const PCCBosscontract = require("../../artifacts/contracts/PCCBoss.sol/PCCBoss.json");
const PCCBosscontractInterface = PCCBosscontract.abi;
const NFTcontract = require("../../artifacts/contracts/PCCMembershipNFT.sol/PCCMembershipNFT.json");
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


    // Create proposal and get a proposalId in return
    console.log("Proposal ends: ", await hardhatGovernor.proposalDeadline('99301011491081370921425385265785700315509948423946078757943618415147611336444'));
    const mintCalldata = hardhatToken.interface.encodeFunctionData("mintNFT", [process.env.MEMBER_VOTED_PUBLIC_KEY] );
    const descriptionHash = ethers.utils.id('Proposal #1: Mint membership');
    const queue = await hardhatGovernor.queue([process.env.NFT_CONTRACT_ADDRESS],[0],[mintCalldata], descriptionHash);
    let receipt = await queue.wait();
  
    console.log("ProposalId: ", receipt.events[1].args.proposalId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
