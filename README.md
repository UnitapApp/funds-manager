# Unitap Funds Manager

This contract manages funds with a periodic withrawal limit.

This system has two roles: `UNITAP` and `DEFAULT_ADMIN_ROLE.`
`UNITAP` is allowed to withdraw funds from this contract with a preset periodic limit (e.g., 1 ETH per day). However, `DEFAULT_ADMIN_ROLE` is allowed to withdraw funds without any limits. In addition to that, it can set the period duration and periodic withdrawal limit.

Both `ERC10` native chain assets and `ERC20` tokens are supported.

## Quick Start

```shell
yarn install
npx hardhat typechain
npx hardhat test
```
