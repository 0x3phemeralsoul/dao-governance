const chai = require('chai')
const { loadFixture, time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { solidity } =  require('ethereum-waffle');
const { ethers } = require('hardhat');
const { expect } = chai;
chai.use(solidity);

describe("Governor smart contracts", function () {
  async function deployTokenFixture() {
    const [minter, burner, uri, admin, deployer, anyone, member1, member2, memberVoted, memberQuestWinner] = await ethers.getSigners();
    //Deploy NFT

    const Token = await ethers.getContractFactory("PCCMembershipNFT", deployer);

    console.log( "Minter", minter.address);
    console.log( "Burner", burner.address);
    console.log( "Uri", uri.address);
    console.log( "Deployer", deployer.address);
    console.log( "Anyone", anyone.address);
    console.log( "Member1", member1.address);
    console.log( "Member2", member2.address);
    console.log( "Admin", admin.address);
    console.log("Member voted", memberVoted.address);
    console.log("Member voted", memberQuestWinner.address);

    const hardhatToken = await Token.deploy(minter.address, burner.address, uri.address, admin.address, '');

    await hardhatToken.deployed();
    console.log("NFT Deployed at", hardhatToken.address);

    //create DAO members for later voting needs.
    await hardhatToken.connect(minter).mintNFT(member1.address);
    await hardhatToken.connect(minter).mintNFT(member2.address);

    //deploy Governor and TimelockController
    const Governor = await ethers.getContractFactory("PCCBoss", deployer);
    const TimelockController = await ethers.getContractFactory("TimelockController", deployer);

    //deploy verifier and pairing
/*     const Pairing = await ethers.getContractFactory("Pairing", deployer);
    const hardhatPairing = await Pairing.deploy()    */    
    const Verifier = await ethers.getContractFactory("Verifier", deployer);
    const hardhatVerifier = await Verifier.deploy()   

    //deploy quest
    const Quest = await ethers.getContractFactory("Quest", deployer);
    const hardhatQuest = await Quest.deploy(hardhatToken.address, hardhatVerifier.address)
    

    const hardhatTimelockController = await TimelockController.deploy(172800, [admin.address], [admin.address], admin.address); //set mindelay to 2 days(172800)
    await hardhatTimelockController.deployed();
    const hardhatGovernor = await Governor.deploy(hardhatToken.address, hardhatTimelockController.address);
    await hardhatGovernor.deployed();

    

    console.log("hardhatTimelockController Deployed at", hardhatTimelockController.address);
    console.log("hardhatGovernor Deployed at", hardhatGovernor.address);
    console.log("hardhatPairing Deployed at", hardhatPairing.address);
    console.log("hardhatVerifier Deployed at", hardhatVerifier.address);
    console.log("hardhatQuest Deployed at", hardhatQuest.address);
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


    // Set Timelock as Admin, Uri Minter and Burner on NFT token
    console.log("DEFAULT_ADMIN_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")));
    console.log("URI_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")));
    console.log("BURNER_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")));
    console.log("MINTER_ROLE", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")));

    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatTimelockController.address );
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),hardhatTimelockController.address );
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")),hardhatTimelockController.address );
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),hardhatTimelockController.address );

    //give Quest minter role on NFT token
    await hardhatToken.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatQuest.address );


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
      hardhatQuest,
      hardhatVerifier,
      minter, 
      burner, 
      uri, 
      admin, 
      deployer, 
      anyone, 
      member1,
      member2,
      memberVoted,
      memberQuestWinner
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


  it("Check Token NFT roles are all on Timelock  ", async function () {
    const { hardhatToken, hardhatTimelockController } = await loadFixture(deployTokenFixture);

    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatTimelockController.address)).to.be.true; 
    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),hardhatTimelockController.address)).to.be.true;  
    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("URI_ROLE")),hardhatTimelockController.address)).to.be.true; 
    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),hardhatTimelockController.address)).to.be.true;                       
  });


  it("Checks Token NFT mint role is on quest  ", async function () {
    const { hardhatToken, hardhatQuest} = await loadFixture(deployTokenFixture);

    expect(await hardhatToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),hardhatQuest.address)).to.be.true;                      
  });



  





  it("Propose giving membership to 1 new member", async function () {
    const { hardhatToken, hardhatGovernor, memberVoted, member1 } = await loadFixture(deployTokenFixture);

    //Member gets voting power
    // check that member1 has an NFT in order to create a proposal
    expect(await hardhatToken.balanceOf(member1.address)).to.equal(1);
    //let tx = await hardhatToken.connect(member1).delegate(member1.address);
    //Mines blocks to ensure the require statement on Governor.sol on propose function is true: getVotes(_msgSender(), block.number - 1) >= proposalThreshold(),
    await mine(10);
    // Create proposal and get a proposalId in return
    const mintCalldata = hardhatToken.interface.encodeFunctionData("mintNFT", [memberVoted.address] );
    tx = await hardhatGovernor.connect(member1).propose([hardhatToken.address],[0],[mintCalldata],'Proposal #1: Mint membership');
    let receipt = await tx.wait();
    expect(Number(receipt.events[0].args.proposalId)).to.be.greaterThan(0);

  });



  it("Cast vote on proposal to add new member", async function () {
    const { hardhatToken, hardhatGovernor, memberVoted, member1} = await loadFixture(deployTokenFixture);

    //
    // Member gets voting power
    //


    // check that member1 has an NFT in order to create a proposal
    expect(await hardhatToken.balanceOf(member1.address)).to.equal(1);

    //let tx = await hardhatToken.connect(member1).delegate(member1.address);
    //let receipt = await tx.wait();
    //Mines blocks to ensure the require statement on Governor.sol on propose function is true: getVotes(_msgSender(), block.number - 1) >= proposalThreshold(),
    await mine(10);


    //
    // Create proposal and get a proposalId in return
    //


    const mintCalldata = hardhatToken.interface.encodeFunctionData("mintNFT", [memberVoted.address] );
    tx = await hardhatGovernor.connect(member1).propose([hardhatToken.address],[0],[mintCalldata],'Proposal #1: Mint membership');
    receipt = await tx.wait();
    expect(Number(receipt.events[0].args.proposalId)).to.be.greaterThan(0);
    const proposalId = receipt.events[0].args.proposalId


    //
    // VOTE PROPOSAL
    //
    await mine(1); //voting_delay is 1 block
    const cast_vote =await hardhatGovernor.connect(member1).castVoteWithReason(proposalId, 1, "I like it");
    receipt = await cast_vote.wait();
    expect(receipt.events[0].args.reason).to.equal("I like it");

  });


  it("Queue and Execute proposal to add new member", async function () {
    const { hardhatToken, hardhatGovernor, memberVoted, member1, member2 } = await loadFixture(deployTokenFixture);

    //
    // Member gets voting power
    //


    // check that member1 has an NFT in order to create a proposal
    expect(await hardhatToken.balanceOf(member1.address)).to.equal(1);

    let votes = await hardhatToken.getVotes(member1.address);
    //let tx = await hardhatToken.connect(member1).delegate(member1.address);
    //member2 delegates to itself as well to get 80 of quorum for the vote
    //await hardhatToken.connect(member2).delegate(member2.address);
    //let receipt = await tx.wait();
    votes = await hardhatToken.getVotes(member1.address);
    //Mines blocks to ensure the require statement on Governor.sol on propose function is true: getVotes(_msgSender(), block.number - 1) >= proposalThreshold(),
    await mine(1);


    //
    // Create proposal and get a proposalId in return
    //


    const mintCalldata = hardhatToken.interface.encodeFunctionData("mintNFT", [memberVoted.address] );
    tx = await hardhatGovernor.connect(member1).propose([hardhatToken.address],[0],[mintCalldata],'Proposal #1: Mint membership');
    receipt = await tx.wait();
    expect(Number(receipt.events[0].args.proposalId)).to.be.greaterThan(0);
    const proposalId = receipt.events[0].args.proposalId



    //
    // VOTE PROPOSAL
    //
    await mine(1); //voting_delay is 1 block
    const cast_vote =await hardhatGovernor.connect(member1).castVoteWithReason(proposalId, 1, "I like it");
    receipt = await cast_vote.wait();
    expect(receipt.events[0].args.reason).to.equal("I like it");

    const cast_vote2 =await hardhatGovernor.connect(member2).castVoteWithReason(proposalId, 1, "I like it too");
    receipt = await cast_vote2.wait();
    expect(receipt.events[0].args.reason).to.equal("I like it too");


 

    //
    // QUEUE and EXECUTE
    //
    await mine(await hardhatGovernor.proposalDeadline(proposalId));  // Ends voting period
    const descriptionHash = ethers.utils.id('Proposal #1: Mint membership');
    const queue = await hardhatGovernor.queue([hardhatToken.address],[0],[mintCalldata], descriptionHash);
    receipt = await queue.wait();
    expect(Number(receipt.events[1].args.eta)).to.be.greaterThan(0);
    await mine(172800); // wait 2 days in order for Timelock to execute proposal
    await hardhatGovernor.execute([hardhatToken.address],[0],[mintCalldata], descriptionHash);
    expect(await hardhatToken.balanceOf(memberVoted.address)).to.equal(1);

  });




  it("Checks quest can mint NFT with correct answer", async function () {
    const { hardhatToken, hardhatQuest, hardhatVerifier, memberQuestWinner} = await loadFixture(deployTokenFixture);
    const proof = [["0x20ae5f121eb8e3f6c5e23a990e8294ffdfd3b2e69270e68c6939baedf122d767","0x08185e37be16c549166e0f73201f225bb4192e9332c24f401bb07040ded0fd27"],[["0x212817f53156d838f3f4b8adb18e7ca8de5bfa3ac7e9f59ea78c17c3bd5e1772","0x19926fe05a5f9217a5262ea6a1330dcc9d728c3cc31912c97d6ab21fb45caecc"],["0x1168e6cad99e25ebb29167ab3ac4fca3eb844c1b71854852064d8463ac2f7aac","0x2f7e9bd9eafd4bbd12b070fa29e723a2e4a6701c8cbd4c249e5dd44969858773"]],["0x11a506e98abeebc2bccb7dce2020a921f040cd6f9618826f56548cb59c5fe843","0x1d70d485256ea22ee66a5d20b6b8c6d8c69a425385fbea44fd7f37eb3dd2d8df"]];
    const input = ["0x000000000000000000000000000000000000000000000000000000009f64a747","0x00000000000000000000000000000000000000000000000000000000e1b97f13","0x000000000000000000000000000000000000000000000000000000001fabb6b4","0x0000000000000000000000000000000000000000000000000000000047296c9b","0x000000000000000000000000000000000000000000000000000000006f0201e7","0x000000000000000000000000000000000000000000000000000000009fb3c535","0x000000000000000000000000000000000000000000000000000000006e6c77e8","0x000000000000000000000000000000000000000000000000000000009b6a806a"];
    const isCorrect = await hardhatVerifier.verifyTx(proof,input);
    console.log("Answer: ", isCorrect);
    expect(await hardhatVerifier.verifyTx(proof,input)).to.be.true;
    await hardhatQuest.issueMembership(memberQuestWinner.address,proof,input);
    expect(await hardhatToken.balanceOf(memberQuestWinner.address)).to.equal(1);                      
  });


});
