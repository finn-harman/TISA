pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./Proposal.sol";
import "./Verifier.sol";

/// @notice A service which regulates the creation and transfer of Income Sharing Agreements
contract Regulator is Ownable {

  Verifier private verifier;

  event requestProposal(Proposal proposal);

  constructor(Verifier _verifier) public {
    verifier = _verifier;
  }

  /* bytes32[] private hashes;

  function addHash(bytes32 hash) external onlyOwner {
    hashes.push(hash);
  } */

  /**
   * @dev Requests linking of address to real world identity via zero knowledge
   * proof.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   */
  function register(
    /* uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[3] memory input */
  ) public returns(bool)
  {
    // Calls zero knowledge proof to verify identity
    /* return verifier.verifyTx(a, b, c, input); */
    return true;
  }

  /**
   * @dev Requests creation of new ISA. Proposal is compared to whitelist and
   * legal contract emails are sent if valid
   *
   * Returns a boolean value and message indicating whether the operation
   * succeeded and why.
   */
  function request(Proposal proposal) public returns(bool, string memory) {
    if (!proposal.bothAgree()) {
      return (false, "Both parties must agree to proposal");
    } else {
      // Access off-chain database and check validity of ISA proposal
      emit requestProposal(proposal);
      return (true, "Proposal successful");
    }
  }
}
