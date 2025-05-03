import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { switchToSepoliaNetwork } from '../utils/contractUtils';
import { Wallet, LogOut, AlertTriangle, RefreshCw } from 'lucide-react';

const WalletConnection = () => {
  const { account, handleAccountChange } = useContext(AppContext);
  const [network, setNetwork] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      checkConnection();
    }

    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    try {
      // Get accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      // Get network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Check if connected to Sepolia (chainId: 0xaa36a7)
      const isSepolia = chainId === '0xaa36a7';
      setIsCorrectNetwork(isSepolia);

      // Set network name
      setNetwork(getNetworkName(chainId));

      // Handle accounts
      handleAccountsChanged(accounts);
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      handleAccountChange('');
    } else {
      // Account changed
      const account = accounts[0];
      handleAccountChange(account);
    }
  };

  const handleChainChanged = (chainId) => {
    // Check if connected to Sepolia (chainId: 0xaa36a7)
    const isSepolia = chainId === '0xaa36a7';
    setIsCorrectNetwork(isSepolia);

    // Set network name
    setNetwork(getNetworkName(chainId));

    // Reload the page to refresh the connection
    window.location.reload();
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0xaa36a7':
        return 'Sepolia';
      case '0x5':
        return 'Goerli';
      case '0x13881':
        return 'Mumbai';
      default:
        return 'Unknown Network';
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        // Check if connected to Sepolia (chainId: 0xaa36a7)
        const isSepolia = chainId === '0xaa36a7';
        setIsCorrectNetwork(isSepolia);

        // Set network name
        setNetwork(getNetworkName(chainId));

        // Handle accounts
        handleAccountsChanged(accounts);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepoliaNetwork();
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const disconnectWallet = () => {
    // MetaMask doesn't support programmatic disconnection
    // We can only clear our state
    handleAccountChange('');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-info">
      {!account ? (
        <button className="connect-button" onClick={connectWallet}>
          <Wallet size={18} />
          <span>Connect Wallet</span>
        </button>
      ) : (
        <>
          <div className="account-display">
            <Wallet size={16} />
            <span>{formatAddress(account)}</span>
            <span className="network-badge" style={{
              backgroundColor: isCorrectNetwork ? 'var(--success)' : 'var(--warning)'
            }}>
              {isCorrectNetwork ? null : <AlertTriangle size={14} />}
              <span>{network}</span>
            </span>
          </div>

          {!isCorrectNetwork && (
            <button className="connect-button switch-network" onClick={handleSwitchNetwork}>
              <RefreshCw size={16} />
              <span>Switch to Sepolia</span>
            </button>
          )}

          <button className="connect-button disconnect" onClick={disconnectWallet}>
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </>
      )}
    </div>
  );
};

export default WalletConnection;
