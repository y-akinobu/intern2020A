pragma solidity ^0.4.0;

contract Sample {
    
    /*storage*/
    uint public number;

    /*event*/
    event Set(address from, uint number);

    function setEventNumber(uint _number) public {
        number = _number;
    }

    /*function setting number to user input*/
    function setNumber(uint _number) public {
        number = _number;
        emit Set(msg.sender, _number);
    }
    
    /*getter for the number*/
    function getNumber() public constant returns (uint) {
        return number;
    }
}
