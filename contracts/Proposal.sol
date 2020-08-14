pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./Regulator.sol";

contract Proposal {

  Regulator private regulator;

  address public lenderAddress;
  address public borrowerAddress;
  uint256 public isaAmount;
  uint256 public incomePercentage;
  uint256 public timePeriod;
  uint256 public minimumIncome;
  uint256 public paymentCap;
  string public symbol;

  bool public lenderAgree;
  bool public borrowerAgree;
  bool public bothAgree;
  bool public rejected;

  constructor(
    address _lenderAddress,
    address _borrowerAddress,
    uint256 _isaAmount,
    uint256 _incomePercentage,
    uint256 _timePeriod,
    uint256 _buyoutAmount,
    uint256 _minimumIncome,
    uint256 _paymentCap,
    string memory _symbol,
    Regulator _regulator
  )
    public
  {
    require(_regulator.getConfirmedAddress(_lenderAddress));
    require(_regulator.getConfirmedAddress(_borrowerAddress));
    require(_isaAmount > 0);
    require(_incomePercentage >= 0);
    require(_incomePercentage <= 100);
    require(_timePeriod > 0);
    require(_minimumIncome > 0);
    require(_paymentCap > 0);
    require(_paymentCap > _minimumIncome);

    lenderAddress = _lenderAddress;
    borrowerAddress = _borrowerAddress;
    isaAmount = _isaAmount;
    incomePercentage = _incomePercentage;
    timePeriod = _timePeriod;
    minimumIncome = _minimumIncome;
    paymentCap = _paymentCap;
    symbol = _symbol;
    regulator = _regulator;

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

  function reject() external {
    require(msg.sender == lenderAddress || msg.sender == borrowerAddress);
    rejected == true;
  }

  function isPending() external view returns (bool) {
    if (msg.sender == lenderAddress && !lenderAgree) {
      return true;
    }
    if (msg.sender == borrowerAddress && !borrowerAgree) {
      return true;
    }
    return false;
  }

  function isSigned() external view returns (bool) {
    if (msg.sender == lenderAddress && lenderAgree) {
      return true;
    }
    if (msg.sender == borrowerAddress && borrowerAgree) {
      return true;
    }
    return false;
  }
}
