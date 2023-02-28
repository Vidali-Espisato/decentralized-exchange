// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.2;


contract Exchange {
    address public account;
    address public feeAccount;
    uint256 public feePercent;


    constructor(address _account, address _feeAccount, uint256 _feePercent) {
        account = _account;
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}