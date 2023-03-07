require('dotenv').config();

async function main() {
    const Token = await ethers.getContractFactory("PCCMembershipNFT");
    const Governor = await ethers.getContractFactory("PCCBoss");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    
    // Start deployment, returning a promise that resolves to a contract object
    const hardhatToken = await Token.deploy(
        process.env.DEPLOYER_PUBLIC_KEY,
        process.env.DEPLOYER_PUBLIC_KEY,
        process.env.DEPLOYER_PUBLIC_KEY,
        process.env.DEPLOYER_PUBLIC_KEY,
        'BaseTokeUri-TBD'
        );
    console.log("NFT Contract deployed to address:", hardhatToken.address);

    const hardhatTimelockController = await TimelockController.deploy(
        172800,
        [process.env.DEPLOYER_PUBLIC_KEY],
        [process.env.DEPLOYER_PUBLIC_KEY],
        process.env.DEPLOYER_PUBLIC_KEY
        ); //set mindelay to 2 days(172800)
    console.log("hardhatTimelockController Contract deployed to address:", hardhatTimelockController.address);

    const hardhatGovernor = await Governor.deploy(hardhatToken.address, hardhatTimelockController.address);
    console.log("hardhatGovernor Contract deployed to address:", hardhatGovernor.address);


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
