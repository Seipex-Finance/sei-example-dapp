# Sei dApp Example

A simple example EVM dApp and framework demonstrating how to build a simple vault contract for depositing and withdrawing Sei tokens on the Sei Network. Includes simple scripts for deploying the contract and a basic frontend interface for interacting with it.

## Features

- Connect wallet using RainbowKit
- Deposit Sei tokens to the vault
- Withdraw Sei tokens from the vault
- View current balance and last update time
- Real-time transaction notifications
- Dark mode by default
- Responsive design

## Tech Stack

### Frontend
- Next.js (Pages Router)
- TypeScript
- wagmi for Ethereum interactions
- RainbowKit for wallet connections
- shadcn/ui for UI components
- Tailwind CSS for styling
- ethers.js for blockchain interactions

### Smart Contracts
- Solidity ^0.8.20
- Custom storage pattern for gas optimization
- Events for deposit and withdrawal tracking
- View functions for balance checking

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Seipex-Finance/sei-example-dapp
cd sei-example-dapp
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the `contracts/` directory with your configuration:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1337420
WS_RPC_URL=wss://evm-ws.sei-apis.com
DEPLOYER_PRIVATE_KEY=your_private_key
```

4. Deploy the contract
```bash
cd contracts/scripts
node deploy.js ../contracts/SeiVault.sol
```

5. Update the contract address in `config/constants.ts`

6. Run the development server
```bash
npm run dev
```

## Contract Features

The `SeiVault` contract includes:
- Deposit function for receiving Sei
- Withdraw function for retrieving Sei
- Balance checking with timestamp
- Gas-optimized storage pattern
- Event emission for tracking
- Basic security checks

## Frontend Features

The dApp interface provides:
- Wallet connection via RainbowKit
- Balance display
- Deposit and withdraw forms
- Transaction status notifications
- Error handling for common scenarios
- Loading states and transaction pending states
- Mobile-responsive design
