require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const contract = require("../artifacts/contracts/PCCMembershipNFT.sol/PCCMembershipNFT.json");
const contractInterface = contract.abi;

// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
let provider = ethers.provider;
const privateKey = `0x${process.env.DEPLOYER_PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey);

wallet.provider = provider;
const signer = wallet.connect(provider);

// https://docs.ethers.io/v5/api/contract/contract
const nft = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS,
  contractInterface,
  signer
);



const main = () => {
  console.log("Waiting 1 blocks for confirmation...");
  nft
    .mintNFT(process.env.MEMBER2_PUBLIC_KEY)    
    .then((tx) => tx.wait(1))
    .then((receipt) => console.log(`Your transaction is confirmed, its receipt is: ${receipt.transactionHash}`))

    .catch((e) => console.log("something went wrong", e));
};

main();
