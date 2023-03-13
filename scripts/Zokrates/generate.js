import { initialize } from "zokrates-js";



initialize().then((zokratesProvider) => {
    const source = 'import "hashes/sha256/sha256Padded";def main(private u8[4] input, u32[8] expected_hash) {u32[8] hash = sha256Padded(input);assert(hash == expected_hash);return;}';
  
    // compilation
    const artifacts = zokratesProvider.compile(source);
  
    // computation
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [["1","2","3","4"], ["0x9f64a747",
    "0xe1b97f13",
    "0x1fabb6b4",
    "0x47296c9b",
    "0x6f0201e7",
    "0x9fb3c535",
    "0x6e6c77e8",
    "0x9b6a806a"]]);
  
    // run setup
    const keypair = zokratesProvider.setup(artifacts.program);
  
    // generate proof
    const proof = zokratesProvider.generateProof(
      artifacts.program,
      witness,
      keypair.pk
    );
  
    // export solidity verifier
    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
    console.log(verifier);
  
    // or verify off-chain
    const isVerified = zokratesProvider.verify(keypair.vk, proof);
    console.log(isVerified)
  });
  


