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
        vk.alpha = Pairing.G1Point(uint256(0x147d100c69fcf500ba58f030ca544244f65363fdd0c44556efd226f5ecb07057), uint256(0x300fdb79d8c96574dbf0b25b2f806d7a24a2f3a7daaa25be9d15c21d9c191f46));
        vk.beta = Pairing.G2Point([uint256(0x152a3740b3975d919dc3ed303281420dcd427c05abf95dbc7a2b4d2358dbb1ad), uint256(0x203db2de28ee5358571e4d0658604c7133c5105da85da0201b0f40e74e3fd677)], [uint256(0x1bf8e68075c07bbff599e724a2d7a66055d4d28a42423bc44e1b7c6f69d2f42d), uint256(0x13d1e512415f345bdf8b549ce67b96741e6f1531fec1c0cd9e232740399fa5ef)]);
        vk.gamma = Pairing.G2Point([uint256(0x2690e9f5e29087b7e9ff1577f6ac7282445860bd238d8c8439efae99969c1501), uint256(0x04f98b5645796105c7479396c5ccfe1a19547cb3f9e0b8c52178bdcad3087d73)], [uint256(0x06c020f870777ababa520608d4c58b2ceb82bfc9a4fd9fdf2f4fb0138d86c384), uint256(0x014aa19e400381cce2f85c72edf6b25de43556903d9748e6fff7124b630278e6)]);
        vk.delta = Pairing.G2Point([uint256(0x1b483873b94017a292d726eaa380b552b102f9c45561ef39844173379780fa67), uint256(0x27733d70f2c8c457554aa9f4b6ae37f81ecf5cb79de52ea3dd449783555f934d)], [uint256(0x15e820ee812fcb7850cb6af1284f16fc7b689c6697a487682f06b45b9a05e9f3), uint256(0x1288473a85914198b807bbb3e12c707b7c226214d4cbb9104d14e20067384c8d)]);
        vk.gamma_abc = new Pairing.G1Point[](9);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x146ebb77468ce7548e7fd7f735f23838c5324ff3a19b52a5d801a00d6db47aef), uint256(0x03837c194abe14780d46e1e7b3d876bf50b9ab64af29d293bdcdfc2866658393));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x1031ecdf487a62fd768ac31eb30660c54e090229ea76ea99496ef981ef28d6e8), uint256(0x0c1291afa11202c4165080b2550b4b34c2153c03d1ecb21b44f451c5e6c845fc));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x24dec020698be43403eed407bd3f0db6c58a3ebdf3d74e1a5749791e0d76bbdf), uint256(0x14015022732b64b1c20b2c588fb60e58b5d14158feddb08ae9dadffc36936e41));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x30322793919878525ac0da693701249aac49dfc47de94f2d38e616c2944ad933), uint256(0x02b6ea409972eeb9a4ff1e0c82e0f604c1d1bbb2e121e34664621d03a53c4219));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x125da52435c594bb6e6e8a31c136383215138528acac1f1eed5460d040b024be), uint256(0x168d2e1655d9f27e86df4ee4bb3331666bdeddf213e6d3947f139b4416eb2be6));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x2201d27c7b7cf1a09c57fddd3f9794d2da59317812758374d301199cdb44cdd0), uint256(0x101ca415d5138b523d66cae7c861d433835a5d7128996d84082681cfea8d2e10));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x07081b141a80763a67449fb490819b66e49706d32b74e3f74511870c8e3f93c7), uint256(0x08cc385da3f8cf5b9f113d910e8ffc369a6be9b0f516368becdb7daaa90bcc2a));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x1c5962cbb317b0cd8e61a604adff2f52b8ea0eb55233b9ff723621bff12e4e31), uint256(0x03e34ca835c05a4ebf488db18f0a24ced5b6eeded1dc05db29656e501fbb2b5a));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x26f269145c2cadace702a04cc065832994a25e9d5cd834af16a256e331b3d93c), uint256(0x0e4f7fe8a025c75b575627af722a14cb493d010d42087bf2f994cf5663cc36ed));
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
