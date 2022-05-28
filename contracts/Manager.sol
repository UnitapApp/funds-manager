//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Manager is AccessControl {
    uint256 public period;
    uint256 public periodicMaxCap;

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

    function setParams(uint256 period_, uint256 periodicMaxCap_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        period = period_;
        periodicMaxCap = periodicMaxCap_;
    }
}
