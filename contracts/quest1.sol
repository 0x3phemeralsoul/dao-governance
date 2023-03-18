// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "./verifier.sol";
import "./PCCMembershipNFT.sol";

contract Quest1 {

    address public immutable verifier;
    address public immutable NFTmembership;


    constructor(address _NFTmembership, address _verifier) {
        verifier = _verifier;
        NFTmembership = _NFTmembership;
    }

    function issueMembersip(address recipient, Verifier.Proof calldata proof,  uint[8] calldata input) external{
        
        require(Verifier(verifier).verifyTx(proof,input), "bad solution, cannot be a member");
        PCCMembershipNFT(NFTmembership).mintNFT(recipient);
    }
}
