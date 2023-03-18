import { initialize } from "zokrates-js";
import fs from 'fs/promises';



async function readArtifacts(filename) {
  try {
    return await fs.readFile('./scripts/Zokrates/Peegy-artifacts/'+filename, { encoding: 'utf8' });
  } catch (err) {
    console.log(err);
  }

}

async function outputPeegyArtifacts(filename, contents) {
  try {
    await fs.writeFile('./scripts/Zokrates/Peggy-artifacts/'+filename, contents);
  } catch (err) {
    console.log(err);
  }
}



initialize().then((zokratesProvider) => {

  let hashedAnswer, artifacts, keypair
  console.log(readArtifacts('artifacts.txt'));
  console.log(artifacts);
  readArtifacts('hashedAnswer.txt').then(hashedAnswer);
  readArtifacts('keypair.pk.txt').then(keypair);


  //peggy provides to the program an answer that might be valid, if valid, then we continue
  const { witness, output } = zokratesProvider.computeWitness(artifacts, [["1","2","3","4"], hashedAnswer ]);

  // Peegy generates the proof taking the program, the witness and the proving keys provided by Governance. The proof is later fed to the VerifyTx on verifier.sol
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair
  );

  outputPeegyArtifacts('proof.txt', JSON.stringify(proof));

  console.log("Proof generated. Pass the 3 arrays to verifyTx() on verifier.sol deployed contract.")

});



