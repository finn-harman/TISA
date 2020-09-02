pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./Proposal.sol";
import "./Verifier.sol";

/// @notice A service which regulates the creation and transfer of Income Sharing Agreements
contract Regulator is Ownable {

  Verifier private verifier;
  mapping(bytes32 => bool) validIdentites;
  mapping(address => bool) confirmedAddresses;
  mapping(bytes32 => bool) confirmedIdentities;

  constructor(Verifier _verifier) public {
    verifier = _verifier;
  }

  /*
  * @dev allows the owner of the contract to add an eligible consumer detail hash
  */
  function addValidIdentity(bytes32 hash) public onlyOwner {
    require(!validIdentites[hash]);
    validIdentites[hash] = true;
  }

  function confirmRegister(bytes32 hash, address user) public onlyOwner {
    require(!confirmedIdentities[hash]);
    confirmedIdentities[hash] = true;
    confirmedAddresses[user] = true;
  }

  function getConfirmedAddress(address person) public view returns(bool) {
    if (confirmedAddresses[person]) {
      return true;
    }
    return false;
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
    //require(validIdentites[hash])
    //require(!confirmedIdentities[hash])
    //require(!confirmedAddresses[hash])

    // Calls zero knowledge proof to verify identity
    bool result = verifier.verifyTx(success);
    if (result) {
      confirmedAddresses[msg.sender] = true;
      //confirmedIdentities[hash] = true;
    }
    return result;
  }

}
