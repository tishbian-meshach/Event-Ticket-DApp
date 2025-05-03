const fs = require('fs');
const path = require('path');

// Path to the compiled contract JSON
const contractBuildPath = path.join(__dirname, '../build/contracts/EventTicketNFT.json');

// Destination directory for the client
const clientContractsDir = path.join(__dirname, '../client/src/contracts');

// Create the directory if it doesn't exist
if (!fs.existsSync(clientContractsDir)) {
  fs.mkdirSync(clientContractsDir, { recursive: true });
}

// Copy the ABI to the client directory
try {
  const contractJson = JSON.parse(fs.readFileSync(contractBuildPath, 'utf8'));
  
  // Create a simplified version with just the ABI and networks
  const simplifiedContract = {
    abi: contractJson.abi,
    networks: contractJson.networks
  };
  
  // Write the simplified contract to the client directory
  fs.writeFileSync(
    path.join(clientContractsDir, 'EventTicketNFT.json'),
    JSON.stringify(simplifiedContract, null, 2)
  );
  
  console.log('Contract ABI copied to client successfully!');
} catch (error) {
  console.error('Error copying contract ABI:', error);
}
