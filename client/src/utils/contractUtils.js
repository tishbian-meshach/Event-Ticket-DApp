import { ethers } from 'ethers';
import EventTicketNFTArtifact from '../contracts/EventTicketNFT.json';

// No special handling needed, we'll disable ESLint for the BigInt usage

// Contract address will be set after deployment
let contractAddress = '';

// Function to set contract address after deployment
export const setContractAddress = (address) => {
  contractAddress = address;
};

// Function to switch to Sepolia network
export const switchToSepoliaNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Chain ID for Sepolia in hex
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7', // Chain ID for Sepolia in hex
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia network to MetaMask:', addError);
        throw addError;
      }
    }
    console.error('Error switching to Sepolia network:', switchError);
    throw switchError;
  }
};

// Function to get contract instance
export const getContractInstance = async (needSigner = false) => {
  if (!contractAddress) {
    throw new Error('Contract address not set');
  }

  console.log('Using contract address:', contractAddress);

  // Check if MetaMask is installed
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install it to use this app.');
  }

  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create a provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('Provider created successfully');

    // Get network information
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);

    // Check if connected to Sepolia testnet
    if (network.chainId !== 11155111n) {
      console.error('Not connected to Sepolia testnet. Please switch networks in MetaMask.');
      throw new Error('Please connect to the Sepolia testnet (Chain ID: 11155111) in your wallet to use this application.');
    }

    // Get the signer if needed
    const signer = needSigner ? await provider.getSigner() : null;
    if (signer) {
      console.log('Signer created successfully');
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);
    }

    // Verify ABI exists
    if (!EventTicketNFTArtifact.abi) {
      console.error('ABI is missing or invalid');
      throw new Error('Contract ABI is missing or invalid');
    }

    // Create contract instance
    console.log('Creating contract instance...');
    const contract = new ethers.Contract(
      contractAddress,
      EventTicketNFTArtifact.abi,
      needSigner ? signer : provider
    );

    console.log('Contract instance created successfully');

    return { contract, provider, signer };
  } catch (error) {
    console.error('Error getting contract instance:', error);
    throw error;
  }
};

// Function to check if an address is a registered organizer
export const isOrganizerRegistered = async (address) => {
  try {
    const { contract } = await getContractInstance();
    return await contract.isOrganizerRegistered(address);
  } catch (error) {
    console.error('Error checking if organizer is registered:', error);
    throw error;
  }
};

// Function to create a new event
export const createEvent = async (
  name,
  description,
  date,
  ticketPrice,
  totalTickets,
  ipfsImageHash,
  maxTicketsPerBuyer,
  transferLocked
) => {
  try {
    const { contract } = await getContractInstance(true);

    // Convert ticket price from ETH to wei
    const ticketPriceWei = ethers.parseEther(ticketPrice.toString());

    // Convert date to Unix timestamp
    const dateTimestamp = Math.floor(new Date(date).getTime() / 1000);

    const tx = await contract.createEvent(
      name,
      description,
      dateTimestamp,
      ticketPriceWei,
      totalTickets,
      ipfsImageHash,
      maxTicketsPerBuyer,
      transferLocked
    );

    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Function to purchase tickets
export const purchaseTickets = async (eventId, quantity, tokenURIs, ticketPrice) => {
  try {
    const { contract } = await getContractInstance(true);

    // Calculate total price
    const priceInWei = ethers.parseEther(ticketPrice.toString());
    // eslint-disable-next-line no-undef
    const totalPrice = priceInWei * BigInt(quantity);

    const tx = await contract.purchaseTickets(
      eventId,
      quantity,
      tokenURIs,
      { value: totalPrice }
    );

    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    throw error;
  }
};

// Function to get event details
export const getEventDetails = async (eventId) => {
  try {
    const { contract } = await getContractInstance();
    const details = await contract.getEventDetails(eventId);

    return {
      name: details[0],
      description: details[1],
      date: new Date(Number(details[2]) * 1000),
      ticketPrice: ethers.formatEther(details[3]),
      totalTickets: Number(details[4]),
      ticketsSold: Number(details[5]),
      organizer: details[6],
      ipfsImageHash: details[7],
      isActive: details[8],
      maxTicketsPerBuyer: Number(details[9]),
      transferLocked: details[10]
    };
  } catch (error) {
    console.error('Error getting event details:', error);
    throw error;
  }
};

// Function to get ticket details
export const getTicketDetails = async (tokenId) => {
  try {
    const { contract } = await getContractInstance();
    const details = await contract.getTicketDetails(tokenId);

    return {
      eventId: Number(details[0]),
      ticketNumber: Number(details[1]),
      originalBuyer: details[2],
      isUsed: details[3],
      purchasePrice: ethers.formatEther(details[4]),
      purchaseDate: new Date(Number(details[5]) * 1000)
    };
  } catch (error) {
    console.error('Error getting ticket details:', error);
    throw error;
  }
};

// Function to mark a ticket as used
export const useTicket = async (tokenId) => {
  try {
    const { contract } = await getContractInstance(true);
    const tx = await contract.useTicket(tokenId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error marking ticket as used:', error);
    throw error;
  }
};

// Function to get all events
export const getAllEvents = async () => {
  try {
    const { contract } = await getContractInstance();
    const eventCount = await contract.getEventCount();

    const events = [];
    for (let i = 0; i < eventCount; i++) {
      try {
        const eventDetails = await getEventDetails(i);
        events.push({
          id: i,
          ...eventDetails
        });
      } catch (error) {
        console.error(`Error fetching event ${i}:`, error);
      }
    }

    return events;
  } catch (error) {
    console.error('Error getting all events:', error);
    throw error;
  }
};

// Function to get token URI
export const getTokenURI = async (tokenId) => {
  try {
    const { contract } = await getContractInstance();
    return await contract.tokenURI(tokenId);
  } catch (error) {
    console.error('Error getting token URI:', error);
    throw error;
  }
};

// Function to get all tickets for an event
export const getEventTickets = async (eventId) => {
  try {
    const { contract } = await getContractInstance();
    return await contract.getEventTickets(eventId);
  } catch (error) {
    console.error('Error getting event tickets:', error);
    throw error;
  }
};

// Function to get all tickets owned by the current user
export const getUserTickets = async () => {
  try {
    const { contract, signer } = await getContractInstance(true);
    const userAddress = await signer.getAddress();

    // Get total number of tokens
    const eventCount = await contract.getEventCount();

    const userTickets = [];

    // Loop through all events
    for (let eventId = 0; eventId < eventCount; eventId++) {
      try {
        // Get all tickets for this event
        const eventTickets = await getEventTickets(eventId);

        // Check each ticket to see if the user owns it
        for (const tokenId of eventTickets) {
          try {
            const owner = await contract.ownerOf(tokenId);

            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              const ticketDetails = await getTicketDetails(tokenId);
              const eventDetails = await getEventDetails(ticketDetails.eventId);

              userTickets.push({
                tokenId: Number(tokenId),
                ...ticketDetails,
                eventName: eventDetails.name,
                eventDate: eventDetails.date
              });
            }
          } catch (error) {
            console.error(`Error checking ownership of token ${tokenId}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing event ${eventId}:`, error);
      }
    }

    return userTickets;
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
};
