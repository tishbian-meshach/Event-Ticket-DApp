/**
 * Decentralized Event Ticketing DApp
 * Truffle configuration file
 */

// Load environment variables
require('dotenv').config();

// Import HDWalletProvider
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Access environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

module.exports = {
  networks: {
    // Development network (local)
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },

    // Sepolia testnet
    sepolia: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, SEPOLIA_RPC_URL),
      network_id: '11155111',
      networkCheckTimeout: 10000,
      timeoutBlocks: 200,
      skipDryRun: true,
      confirmations: 2,
      gasPrice: 5000000000, // 5 gwei
      // gas: 3000000,
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Mocha testing framework configuration
  mocha: {
    timeout: 100000
  },

  // Configure plugins
  plugins: [
    'truffle-plugin-verify'
  ],

  // API keys for verification
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};
