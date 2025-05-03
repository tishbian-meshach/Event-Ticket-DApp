import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getContractInstance } from '../utils/contractUtils';

const OrganizerRegistration = () => {
  const { isOwner, checkUserRole } = useContext(AppContext);
  
  const [organizerAddress, setOrganizerAddress] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerWebsite, setOrganizerWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage('');
    setError('');
    
    // Validate inputs
    if (!organizerAddress || !organizerName) {
      setError('Address and name are required');
      return;
    }
    
    // Validate Ethereum address
    if (!organizerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create organizer details JSON
      const organizerDetails = JSON.stringify({
        name: organizerName,
        email: organizerEmail,
        website: organizerWebsite,
        registrationDate: new Date().toISOString()
      });
      
      // Get contract instance
      const { contract } = await getContractInstance(true);
      
      // Register organizer
      const tx = await contract.registerOrganizer(organizerAddress, organizerDetails);
      await tx.wait();
      
      setMessage(`Organizer registered successfully! Transaction hash: ${tx.hash}`);
      
      // Reset form
      setOrganizerAddress('');
      setOrganizerName('');
      setOrganizerEmail('');
      setOrganizerWebsite('');
      
      // Refresh user role if the registered address is the current user
      checkUserRole();
    } catch (error) {
      console.error('Error registering organizer:', error);
      setError(error.message || 'Failed to register organizer');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="form-container">
        <h2 className="form-title">Organizer Registration</h2>
        <p className="error-message">Only the contract owner can register organizers.</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Register Event Organizer</h2>
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="organizerAddress">Organizer Wallet Address</label>
          <input
            type="text"
            id="organizerAddress"
            value={organizerAddress}
            onChange={(e) => setOrganizerAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizerName">Organizer Name</label>
          <input
            type="text"
            id="organizerName"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            placeholder="Organization name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizerEmail">Email (Optional)</label>
          <input
            type="email"
            id="organizerEmail"
            value={organizerEmail}
            onChange={(e) => setOrganizerEmail(e.target.value)}
            placeholder="contact@example.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizerWebsite">Website (Optional)</label>
          <input
            type="url"
            id="organizerWebsite"
            value={organizerWebsite}
            onChange={(e) => setOrganizerWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register Organizer'}
        </button>
      </form>
    </div>
  );
};

export default OrganizerRegistration;
