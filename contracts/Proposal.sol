pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Proposal {

  uint256 public amount;
  uint256 public percentage;
  uint256 public time;
  address public from;
  address public to;

  bool private fromAgree;
  bool private toAgree;
  bool public bothAgree;

  bool public requested;
  bool public requestStatus;
  string public requestReason;

  constructor(
    uint256 _amount,
    uint256 _percentage,
    uint256 _time,
    address _from,
    address _to
  )
    public
  {
    amount = _amount;
    percentage = _percentage;
    time = _time;
    from = _from;
    to = _to;

    fromAgree = false;
    toAgree = false;
    bothAgree = false;

    requested = false;
  }

  function agree() external {
    require(msg.sender == from || msg.sender == to);
    if (msg.sender == from) {
      fromAgree = true;
    } else {
      toAgree = true;
    }

    if (fromAgree && toAgree) {
      bothAgree = true;
    }
  }

  function disagree() external {
    require(msg.sender == from || msg.sender == to);
    if (msg.sender == from) {
      fromAgree = false;
    } else {
      toAgree = false;
    }
    bothAgree = false;
  }

  function request() external {
    requested = true;
  }

  function setRequestStatus(bool status) external {
    requestStatus = status;
  }

  function setRequestReason(string calldata reason) external {
    requestReason = reason;
  }
}
