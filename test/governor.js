const chai = require('chai')
const { loadFixture, mine, time } = require("@nomicfoundation/hardhat-network-helpers");
const { solidity } =  require('ethereum-waffle');
const { ethers } = require('hardhat');
const { expect } = chai;
chai.use(solidity);

describe("Governor smart contracts", function () {
  async function deployTokenFixture() {
    const [minter, burner, uri, admin, deployer, anyone, member1, member2, memberVoted] = await ethers.getSigners();
    //Deploy NFT

    const Token = await ethers.getContractFactory("NFT", deployer);

    console.log( "Minter", minter.address);
    console.log( "Burner", burner.address);
    console.log( "Uri", uri.address);
    console.log( "Deployer", deployer.address);
    console.log( "Anyone", anyone.address);
    console.log( "Member1", member1.address);
    console.log( "Member2", member2.address);
    console.log( "Admin", admin.address);
    console.log("Member voted", memberVoted.address);

    const hardhatToken = await Token.deploy(minter.address, burner.address, uri.address, admin.address, '');

    await hardhatToken.deployed();
    console.log("NFT Deployed at", hardhatToken.address);

    //create DAO members for later voting needs.
    await hardhatToken.connect(minter).mintNFT(member1.address);
    await hardhatToken.connect(minter).mintNFT(member2.address);

    //deploy Governor
    const Governor = await ethers.getContractFactory("MyGovernor", deployer);
    const TimelockController = await ethers.getContractFactory("TimelockController", deployer);
    

    const hardhatTimelockController = await TimelockController.deploy(172800, [admin.address], [admin.address], admin.address); //set mindelay to 2 days(172800)
    await hardhatTimelockController.deployed();
    const hardhatGovernor = await Governor.deploy(hardhatToken.address, hardhatTimelockController.address);
    await hardhatGovernor.deployed();

    

    console.log("hardhatTimelockController Deployed at", hardhatTimelockController.address);
    console.log("hardhatGovernor Deployed at", hardhatGovernor.address);
    console.log("TIMELOCK_ADMIN_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")));
    console.log("PROPOSER_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")));
    console.log("EXECUTOR_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")));   
    
    //set MyGovernor as proposer in hardhatGovernorTimelockControl
    await hardhatTimelockController.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")),hardhatGovernor.address );
    //set Executor to address(0) in hardhatGovernorTimelockControl
    await hardhatTimelockController.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")), ethers.constants.AddressZero);
    //set timeLockController admin to TimeLockController itself
    await hardhatTimelockController.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")), hardhatTimelockController.address);
    //admin(deployer) address to renounce admin on TimeLockController
    await hardhatTimelockController.connect(admin).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")), admin.address);
    await hardhatTimelockController.connect(admin).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")), admin.address);
    await hardhatTimelockController.connect(admin).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")), admin.address);    


    // TODO: set governor as Admin, Uri Minter and Burner on NFT token
    console.log("DEFAULT_ADMIN_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")));
    console.log("URI_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")));
    console.log("BURNER_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")));
    console.log("MINTER_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")));

    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatGovernor.address );
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),hardhatGovernor.address );
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")),hardhatGovernor.address );
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),hardhatGovernor.address );


    // Admin, Minter, Uri and Burner renounceRole on NFT token

    await hardhatToken.connect(minter).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), minter.address);
    await hardhatToken.connect(burner).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")), burner.address);
    await hardhatToken.connect(uri).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")), uri.address);
    await hardhatToken.connect(admin).renounceRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")), admin.address);


  

    // Fixtures can return anything you consider useful for your tests
    return { 
      hardhatToken, 
      hardhatTimelockController,
      hardhatGovernor,
      minter, 
      burner, 
      uri, 
      admin, 
      deployer, 
      anyone, 
      member1,
      member2,
      memberVoted
   };
  }

 it("Checks if TimeLockController  is Admin of itself", async function () {
    const { hardhatTimelockController } = await loadFixture(deployTokenFixture);

    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")),hardhatTimelockController.address)).to.be.true;
    
  });

  it("Checks if MyGovernor has PROPOSE_ROLE on TimeLockController", async function () {
    const { hardhatTimelockController, hardhatGovernor } = await loadFixture(deployTokenFixture);

    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")),hardhatGovernor.address)).to.be.true;
    
  });

  it("Checks if address(0) has EXECUTOR_ROLE on TimeLockController", async function () {
    const { hardhatTimelockController } = await loadFixture(deployTokenFixture);

    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")),ethers.constants.AddressZero)).to.be.true;
    
  });

  it("Admin wallet has no roles on timelockController", async function () {
    const { hardhatTimelockController, admin } = await loadFixture(deployTokenFixture);

    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")),admin.address)).to.be.false; 
    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")),admin.address)).to.be.false;  
    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")),admin.address)).to.be.false;            
  });

  it("Deployer wallet has no roles on timelockController", async function () {
    const { hardhatTimelockController, deployer } = await loadFixture(deployTokenFixture);

    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")),deployer.address)).to.be.false; 
    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")),deployer.address)).to.be.false;  
    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")),deployer.address)).to.be.false;            
  });


  it("Check Token NFT roles are all on governor  ", async function () {
    const { hardhatToken, hardhatGovernor } = await loadFixture(deployTokenFixture);

    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatGovernor.address)).to.be.true; 
    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),hardhatGovernor.address)).to.be.true;  
    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")),hardhatGovernor.address)).to.be.true; 
    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),hardhatGovernor.address)).to.be.true;                       
  });




/*   it("Propose giving membership to 2 new members", async function () {
    const { hardhatToken, hardhatGovernor, memberVoted, member1 } = await loadFixture(deployTokenFixture);

    // check that member1 has an NFT in order to create a proposal
    expect(await hardhatToken.balanceOf(member1.address)).to.equal(1);

    //Mines blocks to ensure the require statement on Governor.sol on propose function is true: getVotes(_msgSender(), block.number - 1) >= proposalThreshold(),
    console.log("Block: ", await time.latestBlock());
    await mine(10);
    console.log("Block: ", await time.latestBlock());
    const latestBlock = await time.latestBlock();
    const votes = await hardhatGovernor.getVotes(member1.address, latestBlock);
    console.log("Votes: ", votes);
    // Create proposal and get a proposalId in return
    const mintCalldata = hardhatToken.interface.encodeFunctionData("mintNFT", [memberVoted.address] );
    expect(await hardhatGovernor.connect(member1).propose([hardhatToken.address],[0],[mintCalldata],'Proposal #1: Mint membership')).to.equal(1);

  }); */


});
