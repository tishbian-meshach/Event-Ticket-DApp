import React, { createContext, useState, useEffect } from 'react';
import { getContractInstance, isOrganizerRegistered, setContractAddress } from '../utils/contractUtils';

// Create context
export const AppContext = createContext();

// Create provider
export const AppProvider = ({ children, contractAddress }) => {
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  useEffect(() => {
    // Set contract address
    if (contractAddress) {
      setContractAddress(contractAddress);
    }
  }, [contractAddress]);

  useEffect(() => {
    if (account) {
      checkUserRole();
    } else {
      setIsOwner(false);
      setIsOrganizer(false);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const checkUserRole = async () => {
    if (!account) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setIsWrongNetwork(false);

    try {
      console.log('Checking user role for account:', account);
      const { contract } = await getContractInstance();

      // Check if user is owner
      try {
        console.log('Fetching contract owner...');
        const owner = await contract.owner();
        console.log('Contract owner:', owner);
        const isUserOwner = account.toLowerCase() === owner.toLowerCase();
        console.log('Is user owner?', isUserOwner);
        setIsOwner(isUserOwner);
      } catch (ownerError) {
        console.error('Error checking if user is owner:', ownerError);
        setIsOwner(false);
      }

      // Check if user is organizer
      try {
        console.log('Checking if user is a registered organizer...');
        const organizerStatus = await isOrganizerRegistered(account);
        console.log('Is user a registered organizer?', organizerStatus);
        setIsOrganizer(organizerStatus);
      } catch (organizerError) {
        console.error('Error checking if user is organizer:', organizerError);
        setIsOrganizer(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      
      // Check if it's a network error
      if (error.message && error.message.includes('Sepolia testnet')) {
        setIsWrongNetwork(true);
        setError('You are connected to the wrong network. Please switch to the Sepolia testnet.');
      } else {
        setError('Failed to check user role. Please make sure you are connected to the Sepolia testnet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);
  };

  // Context value
  const contextValue = {
    account,
    isOwner,
    isOrganizer,
    isLoading,
    error,
    isWrongNetwork,
    setAccount,
    checkUserRole,
    handleAccountChange
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
