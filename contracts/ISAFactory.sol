pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./Regulator.sol";
import "./Proposal.sol";

/// @notice An ISA factory providing the interface for creation of new ISAs
contract ISAFactory is Ownable {

  Regulator private _regulator;

  constructor(Regulator regulator) public {
    _regulator = regulator;
  }

  /**
   * @dev Creates new ISA proposal which is given to Regulator for approval
   *
   * Returns a boolean value and message indicating whether the operation
   * succeeded and why.
   */
  function newProposal(
    uint256 amount,
    uint256 percentage,
    uint256 time,
    address from,
    address to
  )
    external
  {
    require(amount > 0);
    require(percentage >= 0);
    require(percentage <= 100);
    require(time > 0);
    require(from != address(0));
    require(to != address(0));

    Proposal proposal = new Proposal(amount, percentage, time, from, to);
  }

  function requestProposal(Proposal proposal) external returns(bool, string memory) {
    proposal.request();
    return _regulator.request(proposal);
  }

  /**
   * @dev Creates a new ISA
   */
  function newISA() public onlyOwner {

  }
}
