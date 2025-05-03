import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { createEvent } from '../utils/contractUtils';
import { uploadFileToIPFS, uploadMetadataToIPFS, createEventMetadata } from '../utils/ipfsUtils';

const EventForm = ({ setActiveTab }) => {
  const { isOrganizer } = useContext(AppContext);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [maxTicketsPerBuyer, setMaxTicketsPerBuyer] = useState('');
  const [transferLocked, setTransferLocked] = useState(true);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage('');
    setError('');
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!name || !description || !date || !ticketPrice || !totalTickets || !maxTicketsPerBuyer || !file) {
        throw new Error('All fields are required');
      }
      
      // Validate date is in the future
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      
      // Validate numeric inputs
      if (isNaN(parseFloat(ticketPrice)) || parseFloat(ticketPrice) < 0) {
        throw new Error('Ticket price must be a valid number');
      }
      
      if (isNaN(parseInt(totalTickets)) || parseInt(totalTickets) <= 0) {
        throw new Error('Total tickets must be a positive number');
      }
      
      if (isNaN(parseInt(maxTicketsPerBuyer)) || parseInt(maxTicketsPerBuyer) <= 0) {
        throw new Error('Max tickets per buyer must be a positive number');
      }
      
      if (parseInt(maxTicketsPerBuyer) > parseInt(totalTickets)) {
        throw new Error('Max tickets per buyer cannot exceed total tickets');
      }
      
      // Upload image to IPFS
      const imageResult = await uploadFileToIPFS(file);
      console.log('Image uploaded to IPFS:', imageResult);
      
      // Create and upload metadata to IPFS
      const metadata = createEventMetadata(
        name,
        description,
        eventDate,
        ticketPrice,
        totalTickets,
        imageResult.path
      );
      
      const metadataResult = await uploadMetadataToIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataResult);
      
      // Create event on the blockchain
      const txHash = await createEvent(
        name,
        description,
        eventDate,
        ticketPrice,
        parseInt(totalTickets),
        imageResult.path,
        parseInt(maxTicketsPerBuyer),
        transferLocked
      );
      
      setMessage(`Event created successfully! Transaction hash: ${txHash}`);
      
      // Reset form
      setName('');
      setDescription('');
      setDate('');
      setTicketPrice('');
      setTotalTickets('');
      setMaxTicketsPerBuyer('');
      setTransferLocked(true);
      setFile(null);
      setPreviewUrl('');
      
      // Reset file input
      document.getElementById('eventImage').value = '';
      
      // Redirect to events list after 3 seconds
      setTimeout(() => {
        setActiveTab('events');
      }, 3000);
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOrganizer) {
    return (
      <div className="form-container">
        <h2 className="form-title">Create Event</h2>
        <p className="error-message">Only registered organizers can create events.</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Create New Event</h2>
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Event Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Concert, Conference, etc."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your event..."
            rows="4"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Event Date</label>
          <input
            type="datetime-local"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="ticketPrice">Ticket Price (ETH)</label>
          <input
            type="number"
            id="ticketPrice"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            step="0.001"
            min="0"
            placeholder="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="totalTickets">Total Tickets</label>
          <input
            type="number"
            id="totalTickets"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            min="1"
            placeholder="100"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="maxTicketsPerBuyer">Max Tickets Per Buyer</label>
          <input
            type="number"
            id="maxTicketsPerBuyer"
            value={maxTicketsPerBuyer}
            onChange={(e) => setMaxTicketsPerBuyer(e.target.value)}
            min="1"
            placeholder="4"
            required
          />
          <small>Anti-scalping: Limit how many tickets one address can buy</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="transferLocked">Transfer Restrictions</label>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="transferLocked"
              checked={transferLocked}
              onChange={(e) => setTransferLocked(e.target.checked)}
            />
            <label htmlFor="transferLocked">
              Lock transfers (tickets can only be returned to organizer)
            </label>
          </div>
          <small>Anti-scalping: Prevent ticket reselling</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="eventImage">Event Image</label>
          <input
            type="file"
            id="eventImage"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          <small>Upload a promotional image for your event</small>
          
          {previewUrl && (
            <div className="image-preview">
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  marginTop: '10px',
                  borderRadius: 'var(--border-radius)'
                }}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
