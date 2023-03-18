// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.2;

import './Token.sol';

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public ordersCount;

    mapping (address => mapping (address => uint256)) tokens;
    mapping (uint256 => _Order) orders;
    mapping (uint256 => bool) public cancelledOrders;

    event Deposit(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    event Withdraw(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    event Order(
        uint256 _id,
        address user,
        address iToken,
        uint256 iAmount,
        address oToken,
        uint256 oAmount,
        uint256 timestamp
    );

    event CancelledOrder(
        uint256 _id,
        address user,
        address iToken,
        uint256 iAmount,
        address oToken,
        uint256 oAmount,
        uint256 timestamp
    );

    struct _Order {
        uint256 _id;
        address user;
        address iToken;
        uint256 iAmount;
        address oToken;
        uint256 oAmount;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] += _amount;

        emit Deposit(_token, msg.sender, _amount, balanceOf(_token, msg.sender));
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(balanceOf(_token, msg.sender) >= _amount, "Insufficient balance to withdraw");

        require(Token(_token).transfer(msg.sender, _amount));
        tokens[_token][msg.sender] -= _amount;

        emit Withdraw(_token, msg.sender, _amount, balanceOf(_token, msg.sender));
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function makeOrder(address _oToken, uint256 _oAmount, address _iToken, uint256 _iAmount) public {
        require(balanceOf(_oToken, msg.sender) >= _oAmount);

        ordersCount++;
        orders[ordersCount] = _Order(ordersCount, msg.sender, _iToken, _iAmount, _oToken, _oAmount, block.timestamp);
        emit Order(ordersCount, msg.sender, _iToken, _iAmount, _oToken, _oAmount, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order memory _order = orders[_id];
        require(_order._id == _id);
        require(address(_order.user) == msg.sender);

        cancelledOrders[_id] = true;
        emit CancelledOrder(_order._id, msg.sender, _order.iToken, _order.iAmount, _order.oToken, _order.oAmount, block.timestamp);
    }
}