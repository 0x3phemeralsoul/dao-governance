import { initialize } from "zokrates-js";
import fs from 'fs/promises';



async function outputArtifacts(filename, contents) {
  try {
    await fs.writeFile('./scripts/Zokrates/Governance-artifacts/'+filename, contents);
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
    const source = 'import "hashes/sha256/sha256Padded";def main(private u8[4] input, u32[8] expected_hash) {u32[8] hash = sha256Padded(input);assert(hash == expected_hash);return;}';
  
    // compilation
    const artifacts = zokratesProvider.compile(source);
  
    // computation
    const hashedAnswer = ["0x9f64a747",
    "0xe1b97f13",
    "0x1fabb6b4",
    "0x47296c9b",
    "0x6f0201e7",
    "0x9fb3c535",
    "0x6e6c77e8",
    "0x9b6a806a"];
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [["1","2","3","4"], hashedAnswer ]);

  let keypair
  fs.readFile('./scripts/Zokrates/Peggy-artifacts/keypair.pk.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    keypair = data
    console.log(keypair)

  });

          // generate proof
          const proof = zokratesProvider.generateProof(
            artifacts.program,
            witness,
            keypair
          );
        
        outputPeegyArtifacts('proof.txt', JSON.stringify(proof));
      
        console.log("Proof generated. Pass the 3 arrays to verifyTx() on verifier.sol deployed contract.")
  

  });
  


