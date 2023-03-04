require('dotenv').config();

async function main() {
    const Token = await ethers.getContractFactory("PCCMembershipNFT");
    const Governor = await ethers.getContractFactory("PCCBoss");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    
    // Start deployment, returning a promise that resolves to a contract object
    const nft = await Token.deploy(
        process.env.DEPLOYER_PUBLIC_KEY,
        process.env.DEPLOYER_PUBLIC_KEY,
        process.env.DEPLOYER_PUBLIC_KEY,
        process.env.DEPLOYER_PUBLIC_KEY,
        'BaseTokeUri-TBD'
        );
    console.log("NFT Contract deployed to address:", nft.address);

    const BossMom = await TimelockController.deploy(
        172800,
        [process.env.DEPLOYER_PUBLIC_KEY],
        [process.env.DEPLOYER_PUBLIC_KEY],
        process.env.DEPLOYER_PUBLIC_KEY
        ); //set mindelay to 2 days(172800)
    console.log("BossMom Contract deployed to address:", BossMom.address);

    const PCCBoss = await Governor.deploy(nft.address, BossMom.address);
    console.log("PCCBoss Contract deployed to address:", PCCBoss.address);


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
