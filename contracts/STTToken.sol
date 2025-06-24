// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title STTTokenVault
 * @notice Holds STT faucet tokens and allows the owner (e.g., TapGem) to transfer them to users.
 */
contract STTTokenVault is Ownable {
    IERC20 public immutable sttToken;

    constructor(address _sttToken) {
        require(_sttToken != address(0), "Invalid STT token address");
        sttToken = IERC20(_sttToken);
    }

    /**
     * @notice Transfer STT to a user. Only callable by owner (e.g., TapGem contract).
     */
    function transferTo(address to, uint256 amount) external onlyOwner {
        require(sttToken.balanceOf(address(this)) >= amount, "Insufficient STT balance");
        require(sttToken.transfer(to, amount), "STT transfer failed");
    }

    /**
     * @notice Emergency withdraw by owner (if needed).
     */
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(sttToken.transfer(to, amount), "Withdraw failed");
    }

    /**
     * @notice View how much STT is held in the vault.
     */
    function availableSTT() external view returns (uint256) {
        return sttToken.balanceOf(address(this));
    }
}
