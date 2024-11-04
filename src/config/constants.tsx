export const SEI_VAULT_ADDRESS = "0x8cB6Cf4Ee3891339b53440F4Cb44A67078a21c4D";
export const SEI_VAULT_ABI = [
    "function deposit() external payable",
    "function withdraw(uint256 _amount) external",
    "function getBalance(address user) external view returns (uint256 balance, uint256 lastUpdate)"
] as const;