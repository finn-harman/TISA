pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./Regulator.sol";

/// @notice An ERC1404 token representing an Income Sharing Agreement
contract ISA is IERC20, Ownable {
  using SafeMath for uint256;

  uint256 private _totalSupply;

  string public symbol;
  address payable public initialLenderAddress;
  address payable public borrowerAddress;
  uint256 public isaAmount;
  uint256 public incomePercentage;
  uint256 public timePeriod;
  uint256 public minimumIncome;
  uint256 public paymentCap;
  bool public signed;
  bool public started;
  bool public ended;
  uint256 public startTime;
  uint256 public endTime;
  uint256 public totalPaid;
  bool public transferRequested;

  mapping (address => uint256) private _balances;
  mapping (address => mapping (address => uint256)) private _allowances;
  address payable[] public lenders;
  Request[] public requests;

  Regulator private regulator;

  event ISAStarted(address lenderAddress, address borrowerAddress,
    uint256 isaAmount, uint256 incomePercentage, uint256 timePeriod,
    uint256 minimumIncome, uint256 paymentCap, string symbol);

  /**
   * @dev Sets the value for {symbol}, initializes {_totalSupply} with
   * a default value of 100.
   *
   * Both of these values are immutable: they can only be set once during
   * construction.
   */
  constructor(
    address payable _lenderAddress,
    address payable _borrowerAddress,
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
    require(_regulator.getConfirmedAddress(_lenderAddress));
    require(_regulator.getConfirmedAddress(_borrowerAddress));
    require(_isaAmount > 0);
    require(_incomePercentage >= 0);
    require(_incomePercentage <= 100);
    require(_timePeriod > 0);
    require(_minimumIncome > 0);
    require(_paymentCap > 0);
    require(_paymentCap > _minimumIncome);

    initialLenderAddress = _lenderAddress;
    borrowerAddress = _borrowerAddress;
    isaAmount = _isaAmount;
    incomePercentage = _incomePercentage;
    timePeriod = _timePeriod;
    minimumIncome = _minimumIncome;
    paymentCap = _paymentCap;
    symbol = _symbol;
    regulator = _regulator;

    lenders.push(initialLenderAddress);
    _totalSupply = 100;
    totalPaid = 0;
    signed = false;
    started = false;
    ended = false;
  }

  function isLender(address payable account) public view returns(bool) {
    for (uint256 i = 0 ; i < lenders.length ; i++) {
      if (lenders[i] == account) {
        return true;
      }
    }
    return false;
  }

  function isBorrower(address account) public view returns(bool) {
    if (borrowerAddress == account) {
      return true;
    }
    return false;
  }

  function startISA() public payable {
    require(msg.sender == initialLenderAddress, "only lender can start ISA");
    require(address(this).balance == isaAmount, "ISA must be funded");
    require(msg.value == isaAmount, "ISA must be funded");
    require(signed == true, "legal contract must be signed");

    _balances[initialLenderAddress] = _totalSupply;
    started = true;
    startTime = now;
    endTime = now.add(timePeriod * 1 weeks);

    borrowerAddress.transfer(msg.value);
  }

  function payIncome() public payable notEnded {
    require(msg.sender == borrowerAddress, "only borrower can pay into ISA");
    require(address(this).balance == msg.value, "transfer must fund ISA");
    require(msg.value >= minimumIncome.mul(incomePercentage).div(100), "income must be greater than minimum income");
    require(started == true, "ISA must have started");

    uint256 value = msg.value;
    if (value > paymentCap.mul(incomePercentage).div(100)) {
      value = paymentCap;
    }

    totalPaid = totalPaid.add(msg.value);

    for (uint256 i = 0 ; i < lenders.length ; i++) {
      uint256 amount = value.mul(_balances[lenders[i]]).div(_totalSupply);
      lenders[i].transfer(amount);
    }
  }

  function buyoutISA() public payable notEnded {
    require(msg.sender == borrowerAddress, "only borrower can buyout ISA");
    require(msg.value == buyoutAmount(), "transfer must fund buyout");
    require(address(this).balance == msg.value, "transfer must fund buyout");


    totalPaid = totalPaid.add(msg.value);
    ended = true;

    for (uint256 i = 0 ; i < lenders.length ; i++) {
      _balances[lenders[i]] = 0;
      uint256 amount = msg.value.div(_balances[lenders[i]]).mul(_totalSupply);
      lenders[i].transfer(amount);
    }
  }

  function buyoutAmount() public view notEnded returns (uint256)  {
    uint256 weeksLeft = (timeLeft().div(1 weeks)).add(1);
    uint256 amount = paymentCap * weeksLeft;
    return amount;
  }

  function timeLeft() public view notEnded returns (uint256)  {
    return endTime - now;
  }

  function sign() public {
    signed = true;
  }

  modifier notEnded {
    require (!ended, "ISA has ended!");
    _;
  }

  modifier onlyRegulator {
    require (msg.sender == regulator.owner(), "Only Regulator can call this function");
    _;
  }

  /**
  * @dev Returns total supply of tokens
  */
  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }


  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view override returns (uint256) {
    return _balances[account];
  }

  struct Request {
    address payable from;
    address to;
    uint256 tokenAmount;
    uint256 etherAmount;
    bool agreed;
    bool signed;
    bool completed;
  }

  function getRequestCount() external view returns (uint256) {
    return requests.length;
  }

  function agree(uint256 index) external {
    requests[index].agreed = true;
  }

  function sign(uint256 index) external {
    requests[index].signed = true;
  }

  function complete(uint256 index) external {
    requests[index].completed = true;
  }

  modifier notRestricted(address from, address to, uint256 value) {
    uint8 restrictionCode = detectTransferRestriction(from, to, value);
    require(restrictionCode == 0, messageForTransferRestriction(restrictionCode));
    _;
  }

  function requestTransfer(address recipient, uint256 tokenAmount, uint256 etherAmount)
    external
    notEnded
    notRestricted(msg.sender, recipient, tokenAmount)
  {
    Request memory newRequest;
    newRequest.from = msg.sender;
    newRequest.to = recipient;
    newRequest.tokenAmount = tokenAmount;
    newRequest.etherAmount = etherAmount;
    newRequest.agreed = false;
    newRequest.signed = false;
    newRequest.completed = false;

    requests.push(newRequest);
  }

  function confirmTransfer(address to, address payable from, uint256 tokenAmount, uint256 etherAmount) public payable notEnded {
    require(msg.sender == to);
    require(msg.value == etherAmount, "transfer must be funded");
    require(address(this).balance == msg.value, "transfer must be funded");

    _balances[to] = _balances[to].add(tokenAmount);
    _balances[from] = _balances[from].sub(tokenAmount);

    lenders.push(msg.sender)
    from.transfer(msg.value);
  }

  /**
   * @dev Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address recipient, uint256 amount) external override returns (bool) {
    _balances[recipient] = _balances[recipient].add(amount);
    _balances[msg.sender] = _balances[msg.sender].sub(amount);

    emit Transfer(msg.sender, recipient, amount);

    return true;
  }

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address owner, address spender) external view override returns (uint256) {
    return _allowances[owner][spender];
  }

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 amount) external override returns (bool) {
    return true;
  }

  /**
   * @dev Moves `amount` tokens from `sender` to `recipient` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
    return true;
  }

  /// @notice Detects if a transfer will be reverted and if so returns an appropriate reference code
  /// @param from Sending address
  /// @param to Receiving address
  /// @param value Amount of tokens being transferred
  /// @return Code by which to reference message for rejection reasoning
  /// @dev Overwrite with your custom transfer restriction logic
  function detectTransferRestriction (address from, address to, uint256 value) public view returns (uint8) {
    uint8 restrictionCode = 0;
    if (_balances[msg.sender] < value) {
      restrictionCode = 1;
    }
    if (value <= 0) {
      restrictionCode = 2;
    }
    if (!regulator.getConfirmedAddress(to)) {
      restrictionCode = 3;
    }
    return restrictionCode;
  }

  /// @notice Returns a human-readable message for a given restriction code
  /// @param restrictionCode Identifier for looking up a message
  /// @return Text showing the restriction's reasoning
  /// @dev Overwrite with your custom message and restrictionCode handling
  function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory) {
    if (restrictionCode == 1) {
      return "Token senders balance is too low";
    } else if (restrictionCode == 2) {
      return "Number of tokens to transfer must be greater than 0";
    } else {
      return "Address tokens are transferred to must be registered with Regulator";
    }
  }
}
