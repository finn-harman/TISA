pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./Regulator.sol";

/// @notice An ERC1404 token representing an Income Sharing Agreement
contract ISA is IERC20, Ownable {
  using SafeMath for uint256;

  uint256 private _totalSupply;

  string private _symbol;

  mapping (address => uint256) private _balances;

  mapping (address => mapping (address => uint256)) private _allowances;

  Regulator private _regulator;

  /**
   * @dev Sets the value for {symbol}, initializes {_totalSupply} with
   * a default value of 100.
   *
   * Both of these values are immutable: they can only be set once during
   * construction.
   */
  constructor(string memory symbol, Regulator regulator) public {
    _symbol = symbol;
    _totalSupply = 100;

    _regulator = regulator;
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   */
  function symbol() public view returns (string memory) {
      return _symbol;
  }

  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view override returns (uint256) {
    return _totalSupply;
  }

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view override returns (uint256) {
    return _balances[account];
  }

  /**
   * @dev Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address recipient, uint256 amount) external override returns (bool) {
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
    return 1;
  }

  /// @notice Returns a human-readable message for a given restriction code
  /// @param restrictionCode Identifier for looking up a message
  /// @return Text showing the restriction's reasoning
  /// @dev Overwrite with your custom message and restrictionCode handling
  function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory) {
    return "test";
  }
}
