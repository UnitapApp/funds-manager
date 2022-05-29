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

    modifier onlyUnitapOrAdmin() {
        require(
            hasRole(UNITAP_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Manager: UNAUTHORIZED"
        );
        _;
    }

    function getActivePeriod() public view returns (uint256) {
        return (block.timestamp / period) * period;
    }

    function _checkAndUpdateMaxCap(uint256 amount) internal {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            require(
                totalWithdrawals[getActivePeriod()] + amount <= periodicMaxCap,
                "Manager: PERIODIC_MAX_CAP_EXCEEDED"
            );
            totalWithdrawals[getActivePeriod()] += amount;
        }
    }

    function withdraw(uint256 amount, address to) external onlyUnitapOrAdmin {
        // allow DEFALUT_ADMIN to withdraw as much as he wants
        _checkAndUpdateMaxCap(amount);
        payable(to).transfer(amount);
    }

    function withdrawErc20(
        address token,
        uint256 amount,
        address to
    ) external onlyRole(UNITAP_ROLE) {}

    function setParams(uint256 period_, uint256 periodicMaxCap_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        period = period_;
        periodicMaxCap = periodicMaxCap_;
    }

    function setErc20Params(
        address token,
        uint256 period_,
        uint256 periodicMaxCap_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        erc20Periods[token] = period_;
        erc20PeriodicMaxCap[token] = periodicMaxCap_;
    }

    receive() external payable {}
}
