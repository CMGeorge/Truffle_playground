// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Base {
    //Can't be imutable becaus onlyOwner is called at contract creation when adding first proposal
    // address immutable owner;
    address owner;
    bool locked;
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do this");
        _;
    }

    //Lock any future transaction while important trasactions are in place (as add / remove candiate or change voting state)
    modifier notLocked{
        require(
            !locked,
            "Reentrant call."
        );
        locked = true;
        _;
        locked = false;
    }
    // Do not deploy this on a real contract. Just for testing propose
    function changeOwner(address newOwner) internal onlyOwner {
        owner = newOwner;
    }
}