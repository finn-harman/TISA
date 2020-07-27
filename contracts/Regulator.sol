pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./Proposal.sol";
import "./Verifier.sol";

/// @notice A service which regulates the creation and transfer of Income Sharing Agreements
contract Regulator is Ownable {

  Verifier private verifier;
  mapping(bytes32 => bool) validIdentites;

  event requestProposal(Proposal proposal);

  constructor(Verifier _verifier) public {
    verifier = _verifier;
  }

  /*
  * @dev allows the owner of the contract to add an eligible consumer detail hash
  */
  function addIdentity(bytes32 hash) public onlyOwner {
    require(!validIdentites[hash]);
    validIdentites[hash] = true;
  }


  /**
   * @dev Requests linking of address to real world identity via zero knowledge
   * proof.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   */
  function register(
    bool success
  ) external returns(bool)
  {
    // Calls zero knowledge proof to verify identity
    return verifier.verifyTx(success);
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
