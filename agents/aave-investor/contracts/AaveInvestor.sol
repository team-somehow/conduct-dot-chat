// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AaveInvestor is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public AAVE_POOL;
    address public AAVE_TOKEN;

    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(address _aavePool, address _aaveToken) {
        AAVE_POOL = _aavePool;
        AAVE_TOKEN = _aaveToken;
        IERC20(AAVE_TOKEN).safeIncreaseAllowance(AAVE_POOL, type(uint256).max);
    }

    function deposit(uint256 amount) public nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        IERC20(AAVE_TOKEN).safeTransferFrom(msg.sender, address(this), amount);
        IPool(AAVE_POOL).supply(AAVE_TOKEN, amount, address(this), 0);
        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdrawAll() public nonReentrant {
        uint256 userBalance = balances[msg.sender];
        require(userBalance > 0, "No balance to withdraw");
        balances[msg.sender] = 0;
        IPool(AAVE_POOL).withdraw(AAVE_TOKEN, userBalance, msg.sender);
        emit Withdraw(msg.sender, userBalance);
    }
}
