pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Proposal {

  address public lenderAddress;
  address public borrowerAddress;
  uint256 public isaAmount;
  uint256 public incomePercentage;
  uint256 public timePeriod;
  uint256 public buyoutAmount;
  uint256 public minimumIncome;
  uint256 public paymentCap;

  bool public lenderAgree;
  bool public borrowerAgree;
  bool public bothAgree;

  constructor(
    address _lenderAddress,
    address _borrowerAddress,
    uint256 _isaAmount,
    uint256 _incomePercentage,
    uint256 _timePeriod,
    uint256 _buyoutAmount,
    uint256 _minimumIncome,
    uint256 _paymentCap
  )
    public
  {
    lenderAddress = _lenderAddress;
    borrowerAddress = _borrowerAddress;
    isaAmount = _isaAmount;
    incomePercentage = _incomePercentage;
    timePeriod = _timePeriod;
    buyoutAmount = _buyoutAmount;
    minimumIncome = _minimumIncome;
    paymentCap = _paymentCap;

    lenderAgree = false;
    borrowerAgree = false;
    bothAgree = false;
  }

  function agree() external {
    require(msg.sender == lenderAddress || msg.sender == borrowerAddress);
    if (msg.sender == lenderAddress) {
      lenderAgree = true;
    } else {
      borrowerAgree = true;
    }

    if (lenderAgree && borrowerAgree) {
      bothAgree = true;
    }
  }
}
