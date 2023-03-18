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
        vk.alpha = Pairing.G1Point(uint256(0x121a2400745abdb9784ffc10fb99dcb8ea1e864724b3bf37975e2a450ba3f730), uint256(0x0e9907125e597810c6895af90df73c9a5adf87ce2d3cf960e3d92b0e145ddbdf));
        vk.beta = Pairing.G2Point([uint256(0x1602bf63e8387483899c81ae0f27ba63c2fa65e9f5d997f48cc8c71ee52d5dba), uint256(0x140c120f05be022cb158511acfaaa0d82cd54a774d9f966bdd700b47be02a98c)], [uint256(0x1373e63f10fabe568ff006908924e0c0467ca1a2e856f403cd37e655e6c0df21), uint256(0x0236d46dcc0ccbfa8bc7e9674e0eac7adb54ff8ba7c2cabfeee0cda7e0a39cd3)]);
        vk.gamma = Pairing.G2Point([uint256(0x0078192fbf3fdfe1cc6d8cdd1f3e4e61a53f99d8eecd084284cbb646ece762bf), uint256(0x031aa560d9cdb04b9dda183b3579dbcb9b1e056dd7fea4dff42938eca3ef8e68)], [uint256(0x12ea150b993a8ad26d6908553dfbd0b226c447d1761b98a463b5e53d4b8a8972), uint256(0x2cb27db8542e551cf2390369a636af43701232caf151f86d884ffe244864fdef)]);
        vk.delta = Pairing.G2Point([uint256(0x025f5c5f290feab78af85b92890b0caa91493a75741e5343b976e7afd8afcf5f), uint256(0x1bc31690cd3c1e59eeb44157a2a03286085950e406d775b4b0ef163ea41b0dd5)], [uint256(0x1be2a011f48f225acf5895690b57ddab35c5fb2e69dd7f548f4f4a5cc25d6bb9), uint256(0x2ad79c4b8bcb371c7ec40e9bec6c11528329edfe381a84011eb1e61bf4c965f1)]);
        vk.gamma_abc = new Pairing.G1Point[](9);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x097cfbd0df7711001cdb853b33517967c08d598c566138279fbf05ebb115935f), uint256(0x2bf8a480e35416eb50f460f80017041a94d3f5b8fa0e1c559363acde077739d8));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x213a5fd535cb44a18144e9457eb7c6e602a168ad79c0f1d41fd059c2c35009e4), uint256(0x056f72cee9a16d10c6893b1b8fc53e9796fcbbfbf00273ed2bda6c9a147804ad));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x16a3f33cee0d4161829d4b9c095cfebe4ae21f99af5fef8fa5bd635b250384af), uint256(0x2fb364cabaf08ed7e93b8638e123f66f32b66eb0d534f007ae7eaa49a653498a));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x2c6520dc05e8d5d169730e79af09b0601c555c65b4e664b99d055fadf3c63849), uint256(0x2690c6d27930c5cfe677a9f0b00c2e43bc9fe649bf5b5a34e454aef58b0d1721));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x205dbe1ad34bc1864fe6a546357505d8b885478c54bf8f2ad025176f4dcb974b), uint256(0x172fb252b86b32d63506922658885714557bfce9f29b2f1a100f7df87e94ebfc));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x131b5f84d65ec3c45a23a6a46bf9b14812e65059e363d15382508255b818a7d2), uint256(0x16a5de49ee15222fe0880378736a35ed4f3d416c3c1696d2d8a36a41cfe311ac));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x17afa9ffed4a9d2d455cd116c6544665ee0d370285a28276d3529a26f1b1c5ea), uint256(0x27afdf122643adc88a6c72973fcdac39455ce412657c3375f721f45f5892e859));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x1c84bd2ae2630372f0af87a624d959c78f87bc06e0fb965aba1fbecdcf3913bc), uint256(0x23d4c3f6acad0971cd8ff0c8843898d93ba0724bb59eaff59d80b519743b9c77));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x2cdef331027f6318c016808bc0811475a0526d0935633769d3d4d975c7896746), uint256(0x05e6fe6b815a466e14f859a88ea197bd0ba31b9b930a250e5a4e2784fe53c761));
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
