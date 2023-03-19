require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const Questcontract = require("../../artifacts/contracts/quest.sol/Quest.json");
const QuestcontractInterface = Questcontract.abi;
const contract = require("../../artifacts/contracts/PCCMembershipNFT.sol/PCCMembershipNFT.json");
const contractInterface = contract.abi;

// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
let provider = ethers.provider;
const privateKey = `0x${process.env.MEMBER1_PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey);

wallet.provider = provider;
const signer = wallet.connect(provider);

// https://docs.ethers.io/v5/api/contract/contract
const hardhatQuest = new ethers.Contract(
  process.env.QUEST_CONTRACT_ADDRESS,
  QuestcontractInterface,
  signer
);

// https://docs.ethers.io/v5/api/contract/contract
const nft = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    contractInterface,
    signer
  );

// await network.provider.send("evm_setIntervalMining", [500]);
async function main() {

    const proof = [["0x20ae5f121eb8e3f6c5e23a990e8294ffdfd3b2e69270e68c6939baedf122d767","0x08185e37be16c549166e0f73201f225bb4192e9332c24f401bb07040ded0fd27"],[["0x212817f53156d838f3f4b8adb18e7ca8de5bfa3ac7e9f59ea78c17c3bd5e1772","0x19926fe05a5f9217a5262ea6a1330dcc9d728c3cc31912c97d6ab21fb45caecc"],["0x1168e6cad99e25ebb29167ab3ac4fca3eb844c1b71854852064d8463ac2f7aac","0x2f7e9bd9eafd4bbd12b070fa29e723a2e4a6701c8cbd4c249e5dd44969858773"]],["0x11a506e98abeebc2bccb7dce2020a921f040cd6f9618826f56548cb59c5fe843","0x1d70d485256ea22ee66a5d20b6b8c6d8c69a425385fbea44fd7f37eb3dd2d8df"]];
    const input = ["0x000000000000000000000000000000000000000000000000000000009f64a747","0x00000000000000000000000000000000000000000000000000000000e1b97f13","0x000000000000000000000000000000000000000000000000000000001fabb6b4","0x0000000000000000000000000000000000000000000000000000000047296c9b","0x000000000000000000000000000000000000000000000000000000006f0201e7","0x000000000000000000000000000000000000000000000000000000009fb3c535","0x000000000000000000000000000000000000000000000000000000006e6c77e8","0x000000000000000000000000000000000000000000000000000000009b6a806a"];
    await hardhatQuest.issueMembership(process.env.MEMBER1_PUBLIC_KEY,proof,input);
    console.log("NFT balance of Member1: ", await nft.balanceOf(process.env.MEMBER1_PUBLIC_KEY));


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
