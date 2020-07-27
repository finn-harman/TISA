// This file is LGPL3 Licensed
pragma solidity ^0.6.1;

contract Verifier {
    event Verified(string s);

    function verifyTx(bool success) public returns (bool r) {
        if (success) {
            emit Verified("Transaction successfully verified.");
            return true;
        } else {
            return false;
        }
    }
}
