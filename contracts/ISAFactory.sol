pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./Regulator.sol";
import "./Proposal.sol";

/// @notice An ISA factory providing the interface for creation of new ISAs
contract ISAFactory is Ownable {

  Regulator private regulator;
  Proposal[] private proposals;

  constructor(Regulator _regulator) public {
    regulator = _regulator;
  }

  /**
   * @dev Creates new ISA proposal which is given to Regulator for approval
   *
   * Returns a boolean value and message indicating whether the operation
   * succeeded and why.
   */
  function newProposal(
    address _lenderAddress,
    address _borrowerAddress,
    uint256 _isaAmount,
    uint256 _incomePercentage,
    uint256 _timePeriod,
    uint256 _buyoutAmount,
    uint256 _minimumIncome,
    uint256 _paymentCap
  )
    external
  {
    require(_lenderAddress != address(0));
    require(_borrowerAddress != address(0));
    require(_isaAmount > 0);
    require(_incomePercentage >= 0);
    require(_incomePercentage <= 100);
    require(_timePeriod > 0);
    require(_buyoutAmount > 0);
    require(_minimumIncome > 0);
    require(_paymentCap > 0);

    Proposal proposal = new Proposal(_lenderAddress, _borrowerAddress,
      _isaAmount, _incomePercentage, _timePeriod, _buyoutAmount, _minimumIncome,
      _paymentCap);

    proposals.push(proposal);
  }

  function requestProposal(Proposal proposal) external returns(bool, string memory){
    return regulator.request(proposal);
  }

  function getProposalNumber() public view returns (uint256) {
    uint256 j = 0;
    for (uint256 i = 0 ; i < proposals.length ; i++) {
      if (proposals[i].lenderAddress() == msg.sender || proposals[i].borrowerAddress() == msg.sender) {
        j++;
      }
    }
    return j;
  }

  function getPendingProposals() external returns (Proposal[] memory coll)
  {
    coll = new Proposal[](getProposalNumber());

    uint256 j = 0;
    for (uint256 i = 0 ; i < proposals.length ; i++) {
      if (proposals[i].lenderAddress() == msg.sender && !proposals[i].lenderAgree()) {
        if (proposals[i].borrowerAddress() == msg.sender && !proposals[i].borrowerAgree()) {
          coll[j] = proposals[i];
          j++;
        }
      }
    }

    return coll;
  }

  function getAllProposals() external returns (Proposal[] memory coll)
  {
    coll = new Proposal[](proposals.length);

    for (uint256 i = 0 ; i < proposals.length ; i++) {
        coll[i] = proposals[i];
    }

    return coll;
  }

  /**
   * @dev Creates a new ISA
   */
  function newISA() public onlyOwner {

  }
}
