//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Manager is AccessControl {
    uint256 public period;
    uint256 public periodicMaxCap;
    mapping(uint256 => uint256) public totalWithdrawals; // period => amount

    mapping(address => uint256) public erc20Periods; // erc20 token => period
    mapping(address => uint256) public erc20PeriodicMaxCap; // erc20 token =>  erc20 periodic max cap
    mapping(address => uint256) public erc20Withdrawals; // erc20 token => period withrawals
    bytes32 public constant UNITAP_ROLE = keccak256("UNITAP_ROLE");

    constructor(
        uint256 period_,
        uint256 periodicMaxCap_,
        address admin,
        address unitap
    ) {
        require(
            admin != address(0) && unitap != address(0),
            "Manager: ZERO_ADDRESS"
        );
        period = period_;
        periodicMaxCap = periodicMaxCap_;
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(UNITAP_ROLE, unitap);
    }

    function getActivePeriod() public view returns (uint256) {
        return (block.timestamp / period) * period;
    }

    function withdraw(uint256 amount, address to)
        external
        onlyRole(UNITAP_ROLE)
    {
        require(
            totalWithdrawals[getActivePeriod()] + amount <= periodicMaxCap,
            "Manager: PERIODIC_MAX_CAP_EXCEEDED"
        );
        totalWithdrawals[getActivePeriod()] += amount;
        payable(to).transfer(amount);
    }

    function setParams(uint256 period_, uint256 periodicMaxCap_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        period = period_;
        periodicMaxCap = periodicMaxCap_;
    }

    function emergencyWithdrawETH(uint256 amount, address to)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        payable(to).transfer(amount);
    }

    receive() external payable {}
}
