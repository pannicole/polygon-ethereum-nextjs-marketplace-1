// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract Sender {

  function send(address payable to) public payable {
      to.transfer(msg.value);
  }
}

contract Receiver {
    receive() payable external {}
}
