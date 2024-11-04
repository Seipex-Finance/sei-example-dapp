// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SeiVaultStorage {
    struct UserBalance {
        uint256 balance;
        uint256 lastUpdate;
    }
    
    bytes32 private constant BALANCE_DATA_POSITION = keccak256("com.seivault.balanceData");
    
    function balanceStorage() 
        internal 
        pure 
        returns (mapping(address => UserBalance) storage balances) 
    {
        bytes32 position = BALANCE_DATA_POSITION;
        assembly {
            balances.slot := position
        }
    }
}

contract SeiVault is SeiVaultStorage {
    event Deposited(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event Withdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    function deposit() external payable {
        require(msg.value > 0, "Must deposit something");
        UserBalance storage userBalance = balanceStorage()[msg.sender];
        userBalance.balance += msg.value;
        userBalance.lastUpdate = block.timestamp;
        
        emit Deposited(
            msg.sender,
            msg.value,
            block.timestamp
        );
    }
    
    function withdraw(uint256 _amount) external {
        UserBalance storage userBalance = balanceStorage()[msg.sender];
        require(userBalance.balance >= _amount, "Insufficient balance");
        
        userBalance.balance -= _amount;
        userBalance.lastUpdate = block.timestamp;
        
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send SEI");
        
        emit Withdrawn(
            msg.sender,
            _amount,
            block.timestamp
        );
    }
    
    function getBalance(address user) external view returns (
        uint256 balance,
        uint256 lastUpdate
    ) {
        UserBalance storage userBalance = balanceStorage()[user];
        return (
            userBalance.balance,
            userBalance.lastUpdate
        );
    }
}