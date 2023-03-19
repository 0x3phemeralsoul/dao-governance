// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x1c5af36d331687dc79fba33c517607bdfd571f897b3ea0de210ac165ca58edd5), uint256(0x0d1022bf1fb5f13154900f468b6a9efb5c27ed472fdcd9d0967020caf2f46e78));
        vk.beta = Pairing.G2Point([uint256(0x2ba860f1368f4e7619d85ad78083f8cbe92a8324ce5dde342baf265834c900fb), uint256(0x16b187ce9bbffaecdb14e983abf6a070136ccea3dfb67a6a02c1b6868d86d483)], [uint256(0x17235827e2c64a5166f740a01639ac5eeeea3a33db066b1ea8b53971751d7c2a), uint256(0x1eea14511f7447ce3f6352d2f6c5dae35224fdfd407abc29b9a304a577fdf4b9)]);
        vk.gamma = Pairing.G2Point([uint256(0x1ac18af2d806b63da83a48e231979720778ce771d4a3f3173247136a9af08461), uint256(0x2c55f05c4a5d3c6ec7b8effa413fba80646b915da32f8832c4ef0073cdabd8fa)], [uint256(0x15d1fa1816b217f1419091e592e131873620f9851ca5db7ba7a881bee312fc20), uint256(0x2ed0f2802a9acb051ccad409736979a565c609bb51494b3c9ca133bdf776ea1c)]);
        vk.delta = Pairing.G2Point([uint256(0x00f954da56feeb5cf59dc7f41df694121081c3253da821f296401567647c7838), uint256(0x2046b2bdc19eef20fb9dbea5d4902a80d6c385b886664d255aa0749084e0f499)], [uint256(0x0950b5dce4535435c3a4048ecbe608f473ce96acdb19194edc0a6129ba01a6a0), uint256(0x2e74b0c5f0df25de6d1867c10a891effaa8917a47e7a54058d89cb879c495eda)]);
        vk.gamma_abc = new Pairing.G1Point[](9);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x124a2b160cd22bfb5a3e1d695f6db1209ef45ad289cfcbb057dcdcfdf931bee6), uint256(0x211adaf687c6626b599a73f94310be3d96ad22ac3a80ea1aefd7a1f1bc8cb52c));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x193095be7226162ae86aea9b1e67fd42fdd6fa7108da6927502df6316da06c61), uint256(0x0c845060467df15ecc8c6a8c443d03f034e5c0a6fbcca0185348dd004d2bfd66));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x0a0b560ab24189f67017fccf208fe7e0f9d45a0fb20150299d374be1d6e5ed19), uint256(0x028cf62f095f0459777e549e48b3b644151c8300db2ed63f772ecd57f98c0bb0));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x2ddceceb4c4978fe36e7cf5690c7ef7c073208cb6027539453cedd5114c58964), uint256(0x18e8a0f323b2c9d56f7e16a71687eadbfd1e8b6c545e318de90c3c0f1513fafa));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x15ad20e6ee3e5e803c330da71382ad533ebf5f4b8b93ec59cd3dedb469478820), uint256(0x11ec7525f1a98d0e1b707174fd6e5345eac2c93489c6f253bad554ccfa79c264));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x172c76edbd9e34fc1ef1ecd279c3d7b14c16a852a335e63977932f5fa345cae4), uint256(0x0d8cd848f609b11adc7339851da038ccbe43042eedecac3f3f7fb476d9e478a3));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x2cf94b463c3d709fc68a20b8b4b01d18400e59b6002f9ac57fe2a73d6ddf7be3), uint256(0x032b7b6e4c171d65d0b558d22c59a7f01c4f34735540d22466dbcdcda707f668));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x0c52882fc77672ab6edfd8a8120f963da36a7aee75606a47669d3edb0318fad9), uint256(0x0c36dbb01e11deaa6700e3200abfb75ea60cc90baa2ffde093bb172d9c8b1332));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x22e6ca2278821b58873078803b9b6cee71b6019d7a9e5eb0efc1ef52b97014fa), uint256(0x2ee76de1cd2c56754226f03e1111a3ffd4e8c08944990ff1e9cb2447a41148bb));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[8] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](8);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
