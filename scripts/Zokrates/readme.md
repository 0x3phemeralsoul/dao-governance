# Creating a verifier.sol for a new set of answers from a quest
Quests are tasks users most perform to gain their access to the DAO.
Quests can be implemented as simple multiple answer options in a survey.
Answers can be any value: numerical, string, address, binary file.
The correct set of answers are ultimately hashed together. Order matters.
For a set of 4 questions, the answers cuold be (as in this example) [1,2,3,4] an array of numeric values

This whole setup is heavily inspired by https://zokrates.github.io/examples/sha256example.html

## generate.js
This file can be run by someone wanting to create a new quest.
The quest creator most pass to the `computeWitness` call 2 values:
1.- The correct answers
2.- The hased version of the correct answers by calling `ethers.utils.sha256([1,2,3,4])` the output is a hex:  0x9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a' which needs to be divided into 8 pieces in an array of 8:

["0x9f64a747", 
"0xe1b97f13", 
"0x1fabb6b4", 
"0x47296c9b", 
"0x6f0201e7", 
"0x9fb3c535", 
"0x6e6c77e8", 
"0x9b6a806a"]

the array is passed to the ' hashedAnswer` variable

Once the file is setup correctly, then the Quest creator must execute the following command from the root folder of this repo: `node scripts/Zokrates/generate.js`
The command will output a set of elements:
1.- On the STDOUT the verifier.sol contract (which is stored in /Governance-artifacts as a file to be deployed).
2.- The off-chain verification which should out put `true`
3.- A set of files stored in Peegy-artifacts. Peggy is the user wanting to join the DAO by passing a, hopefully, correct answer to the Quest website and verifier.sol smart contract. She needs a set of files in order to proof she has passed the correct answer: `witness.txt`, `hashedAnswer.txt` a verification keypair `keypair.vk.txt` and the compiled version of the program `artifacts.txt` in order to generate a proof which can be verified by `verityTx()` in verifier.sol
4.- Governance artifacts that are needed is basically verifier.sol