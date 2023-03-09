require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const NFTcontract = require("../artifacts/contracts/PCCMembershipNFT.sol/PCCMembershipNFT.json");
const NFTcontractInterface = NFTcontract.abi;

// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
let provider = ethers.provider;
const privateKey = `0x${process.env.MEMBER1_PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey);

wallet.provider = provider;
const signer = wallet.connect(provider);


// https://docs.ethers.io/v5/api/contract/contract
const hardhatToken = new ethers.Contract(
    process.env.NFT_CONTRACT_ADDRESS,
    NFTcontractInterface,
    signer
  );

async function main() {
      //Delegate to self
      await hardhatToken.delegate(process.env.MEMBER2_PUBLIC_KEY)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
