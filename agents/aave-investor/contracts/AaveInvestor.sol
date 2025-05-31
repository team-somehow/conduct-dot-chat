// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

contract AaveInvestor {
    address public AAVE_POOL;
    address public AAVE_TOKEN;

    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(address _aavePool, address _aaveToken) {
        AAVE_POOL = _aavePool;
        AAVE_TOKEN = _aaveToken;

        IERC20(AAVE_TOKEN).approve(AAVE_POOL, type(uint256).max);
    }

    function deposit(uint256 amount) public {
        IERC20(AAVE_TOKEN).transferFrom(msg.sender, address(this), amount);

        IPool(AAVE_POOL).supply(AAVE_TOKEN, amount, address(this), 0);

        balances[msg.sender] += amount;

        emit Deposit(msg.sender, amount);
    }

    function withdrawAll() public {
        // Withdraw all the original tokens and send them to the user     
        IPool(AAVE_POOL).withdraw(AAVE_TOKEN, type(uint256).max, msg.sender);

        uint256 balance = balances[msg.sender];
        balances[msg.sender] = 0;

        emit Withdraw(msg.sender, balance);
    }
}
