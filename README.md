# Decentralized Event Ticketing DApp

A decentralized application (DApp) aimed at disrupting the event ticketing industry by minimizing scalping and eliminating counterfeit tickets. Each event ticket is issued as a unique NFT with programmable transfer rules.

## Features

- **NFT Tickets**: Each ticket is a unique NFT with verifiable ownership and authenticity
- **Anti-Scalping Measures**: Smart contract enforces rules to prevent ticket scalping
- **Event Management**: Organizers can create events and set ticket parameters
- **Ticket Verification**: Easy verification of ticket authenticity at event check-in
- **IPFS Integration**: Images and metadata are stored on IPFS for decentralized storage

## Technology Stack

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract**: Solidity
- **Development Framework**: Truffle
- **Frontend**: React.js
- **Web3 Integration**: ethers.js
- **Decentralized Storage**: IPFS (via Pinata)
- **Token Standard**: ERC-721 (NFTs)

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask browser extension
- Truffle CLI

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd EventTicketDApp
   ```

2. Install dependencies:
   ```
   npm install
   npm run client-install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Ethereum wallet private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here

   # Sepolia testnet RPC URL (e.g., from Alchemy)
   SEPOLIA_RPC_URL=your_sepolia_rpc_url_here

   # Optional: Etherscan API Key for contract verification
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

4. Create a `.env` file in the client directory with the following variables:
   ```
   # Contract address (will be set after deployment)
   REACT_APP_CONTRACT_ADDRESS=your_contract_address_here

   # Pinata API credentials for IPFS storage
   REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
   REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
   REACT_APP_PINATA_GATEWAY=your_pinata_gateway_url_here
   REACT_APP_PINATA_API_URL=https://api.pinata.cloud
   ```

## Deployment Instructions

### Compiling the Smart Contract

1. Compile the smart contract:
   ```
   npx truffle compile
   ```

2. Copy the ABI to the client directory:
   ```
   node scripts/copyAbi.js
   ```

### Deploying to Sepolia Testnet

1. Make sure your `.env` file is configured with the correct private key and Sepolia RPC URL.

2. Deploy to Sepolia testnet:
   ```
   npx truffle migrate --network sepolia
   ```

3. After successful deployment, you'll see the contract address in the console output. Copy this address and update the `REACT_APP_CONTRACT_ADDRESS` in the client's `.env` file.

### Running the Frontend

1. Start the React development server:
   ```
   cd client
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Smart Contract

The main smart contract is `EventTicketNFT.sol`, which extends ERC721 with additional functionality:

- Registration of event organizers
- Creation and management of events
- Minting of tickets as NFTs
- Anti-scalping measures through transfer restrictions
- Ticket verification and usage tracking

## Frontend

The React frontend provides interfaces for:

- Connecting to MetaMask
- Browsing events
- Purchasing tickets
- Managing owned tickets
- Verifying tickets (for organizers)
- Creating events (for organizers)

## License

MIT

## Contributors

- Event Ticket DApp Team
