import { initialize } from "zokrates-js";
import fs from 'fs/promises';



async function readArtifacts(filename) {
  try {
    return await fs.readFile('./scripts/Zokrates/Peggy-artifacts/'+filename, { encoding: 'utf8' });
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



async function generateProof() {
  let contents
  const zokratesProvider = await initialize();

  const source = 'import "hashes/sha256/sha256Padded";def main(private u8[4] input, u32[8] expected_hash) {u32[8] hash = sha256Padded(input);assert(hash == expected_hash);return;}';
  
  // compilation
  const artifacts = await zokratesProvider.compile(source);


  contents = await readArtifacts('hashedAnswer.txt');
  const hashedAnswer = contents.replaceAll('"', "").replaceAll('[','').replaceAll(']','').split(",")
  contents = await readArtifacts('keypair.pk.txt')
  const keypair = contents.split(",")


  //peggy provides to the program an answer that might be valid, if valid, then we continue
    const { witness, output } = await zokratesProvider.computeWitness(artifacts, [["1","2","3","4"], hashedAnswer ]);

    
  // Peegy generates the proof taking the program, the witness and the proving keys provided by Governance. The proof is later fed to the VerifyTx on verifier.sol
  const proof = await zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair
  );

  outputPeegyArtifacts('proof.txt', JSON.stringify(proof));

  console.log("Proof generated. Pass the 3 arrays to verifyTx() on verifier.sol deployed contract.") 
  console.log(zokratesProvider.utils.formatProof(proof))


  }
generateProof();



