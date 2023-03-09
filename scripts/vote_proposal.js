require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const PCCBosscontract = require("../artifacts/contracts/PCCBoss.sol/PCCBoss.json");
const PCCBosscontractInterface = PCCBosscontract.abi;

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

// await network.provider.send("evm_setIntervalMining", [500]);
async function main() {


    await hardhatGovernor.castVoteWithReason(process.env.PROPOSAL_ID, 1, "I like it");
    console.log("Has voted? ", await hardhatGovernor.hasVoted(process.env.PROPOSAL_ID,process.env.MEMBER1_PUBLIC_KEY));
    // Create proposal and get a proposalId in return

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
