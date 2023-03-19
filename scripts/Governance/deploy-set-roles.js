require('dotenv').config();

async function main() {
    const Token = await ethers.getContractFactory("PCCMembershipNFT");
    const Governor = await ethers.getContractFactory("PCCBoss");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const Quest = await ethers.getContractFactory("Quest");
/*     const Pairing = await ethers.getContractFactory("Pairing");
    const hardhatPairing = await Pairing.deploy()     
    await hardhatPairing.deployed();   */
    const Verifier = await ethers.getContractFactory("Verifier");
    const hardhatVerifier = await Verifier.deploy() 
    
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

    const hardhatQuest = await Quest.deploy(hardhatToken.address, hardhatVerifier.address)
    console.log("hardhatQuest Contract deployed to address:", hardhatQuest.address);
    console.log("hardhatVerifier Deployed at", hardhatVerifier.address);
    console.log("hardhatQuest Deployed at", hardhatQuest.address);




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

    
    //set NFT roles to TimeLockController and to Quest
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),hardhatTimelockController.address );
    await hardhatToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatQuest.address );


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
