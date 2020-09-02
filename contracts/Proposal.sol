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
  bool public expired;

  constructor(
    address _lenderAddress,
    address _borrowerAddress,
    uint256 _isaAmount,
    uint256 _incomePercentage,
    uint256 _timePeriod,
    uint256 _minimumIncome,
    uint256 _paymentCap,
    string memory _symbol,
    Regulator _regulator
  )
    public
  {
    require(_isaAmount > 0, "ISA must have value");
    require(_incomePercentage > 0, "Income percentage must be between 0 and 50");
    require(_incomePercentage < 50, "Income percentage must be between 0 and 50");
    require(_timePeriod > 0, "Time period must be positive");
    require(_minimumIncome >= 4.2 ether, "Minimum income must be greater than 4.2 eth");
    require(_paymentCap > 0, "Payment cap must be positive");
    require(_paymentCap > _minimumIncome, "Payment cap must be greater than minimum income");
    require(_regulator.getConfirmedAddress(_lenderAddress), "lender must be registered");
    require(_regulator.getConfirmedAddress(_borrowerAddress), "borrower must be registered");

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
    rejected = true;
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

  function expire() external {
    require(msg.sender == regulator.owner());
    expired = true;
  }
}
