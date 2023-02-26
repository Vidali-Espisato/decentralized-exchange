// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.2;

// import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply; 

    mapping(address => uint256) public balanceOf;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    ); 

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);

        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_value < balanceOf[msg.sender], "Amount should not be greater than sender's balance.");
        require(_to != address(0), "Cannot transfer to null account.");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value < balanceOf[_from], "Amount should not be greater than sender's balance.");
        require(_from != address(0), "Cannot transfer from null account.");
        require(_to != address(0), "Cannot transfer to null account.");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

}
