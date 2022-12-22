const chai = require('chai')
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { solidity } =  require('ethereum-waffle');
const { ethers } = require('hardhat');
const { expect } = chai;
chai.use(solidity);

describe("Governor smart contracts", function () {
  async function deployTokenFixture() {
    const [minter, burner, uri, admin, deployer, anyone, member1, member2] = await ethers.getSigners();
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

    console.log("TIMELOCK_ADMIN_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")));
    console.log("PROPOSER_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")));
    console.log("EXECUTOR_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")));   

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
      member2
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


  it("Propose to ", async function () {
    const { hardhatTimelockController, deployer } = await loadFixture(deployTokenFixture);

    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")),deployer.address)).to.be.false; 
    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")),deployer.address)).to.be.false;  
    expect(await hardhatTimelockController.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TIMELOCK_ADMIN_ROLE")),deployer.address)).to.be.false;            
  });

  /*  it("Should not transfer tokens between accounts", async function () {
    const { hardhatToken, minter, anyone } = await loadFixture(deployTokenFixture);

    await hardhatToken.connect(minter).mintNFT(anyone.address);


    expect(await hardhatToken.totalSupply()).to.equal(1);
    expect(await hardhatToken.balanceOf(anyone.address)).to.equal(1);

    // Transfer NFT reverting
    
    await expect(
      hardhatToken.connect(anyone).transferFrom(anyone.address, minter.address, 1)
    ).to.revertedWith("Err: token transfer is BLOCKED");

  });

  it("Should not mint a second token to the same account", async function () {
    const { hardhatToken, minter, anyone } = await loadFixture(deployTokenFixture);

    await hardhatToken.connect(minter).mintNFT(anyone.address);

    // Minting a second NFT to the same address

    await expect(
      hardhatToken.connect(minter).mintNFT(anyone.address)
    ).to.revertedWith("Err: you already own a token");

  });

  it("Only minter can mint", async function () {
    const { hardhatToken, anyone } = await loadFixture(deployTokenFixture);


    await expect(
      hardhatToken.connect(anyone).mintNFT(anyone.address)
    ).to.revertedWith("AccessControl: account 0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6");

  });


  it("Only uri can change uri", async function () {
    const { hardhatToken, uri, minter, anyone } = await loadFixture(deployTokenFixture);
    await hardhatToken.connect(minter).mintNFT(anyone.address);

    expect(
      await  hardhatToken.tokenURI(1)
    ).to.equal("");

    //Update URI
    await hardhatToken.connect(uri)._setTokenURI("TEST")
    expect(
      await  hardhatToken.tokenURI(1)
    ).to.equal("TEST");

  //cannot update URI
  await expect(
       hardhatToken.connect(minter)._setTokenURI("TEST")
    ).to.revertedWith("AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x8e6595ef9afb2a8f70320f393f567bb7a0e6c4ed483caee30f90cc5fcd6659b4");
});

it("Granting minting rights", async function () {
  const { hardhatToken, admin, anyone } = await loadFixture(deployTokenFixture);
  await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), anyone.address);
  await hardhatToken.connect(anyone).mintNFT(anyone.address);

  expect(await hardhatToken.totalSupply()).to.equal(1);
  expect(await hardhatToken.balanceOf(anyone.address)).to.equal(1);
  expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")), anyone.address))
  .to.be.true;
});

it("Only burner and owner can burn", async function () {
  const { hardhatToken, minter, burner, anyone } = await loadFixture(deployTokenFixture);
  
  await hardhatToken.connect(minter).mintNFT(anyone.address);

  //check that it has been minted to the right receiver.
  expect(await hardhatToken.totalSupply()).to.equal(1);
  expect(await hardhatToken.balanceOf(anyone.address)).to.equal(1);
  expect(await hardhatToken.ownerOf(1)).to.equal(anyone.address);

  //owner burns and check it has been burned
  await hardhatToken.connect(burner).burn(1);
  expect(await hardhatToken.totalSupply()).to.equal(0);
  expect(await hardhatToken.balanceOf(anyone.address)).to.equal(0);

  // mint a new one
  await hardhatToken.connect(minter).mintNFT(anyone.address);

  // check minting happened correctly
  expect(await hardhatToken.totalSupply()).to.equal(1);
  expect(await hardhatToken.balanceOf(anyone.address)).to.equal(1);
 
  // burner role burns the NFT for receiver
  await hardhatToken.connect(burner).burn(await hardhatToken.tokenOfOwnerByIndex(anyone.address,0));

  // check that receiver's NFT is now burned
  expect(await hardhatToken.totalSupply()).to.equal(0);
  expect(await hardhatToken.balanceOf(anyone.address)).to.equal(0);

  // mint a new one
  await hardhatToken.connect(minter).mintNFT(anyone.address);

  // minter role tries to burn the NFT for receiver
  await expect(
    hardhatToken.connect(minter).burn(await hardhatToken.tokenOfOwnerByIndex(anyone.address,0))
  ).to.revertedWith("Caller cannot burn");


}); */

});
