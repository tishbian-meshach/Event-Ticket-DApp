import React, { useState } from 'react';
import { purchaseTickets } from '../utils/contractUtils';
import { uploadMetadataToIPFS, createTicketMetadata } from '../utils/ipfsUtils';

const EventDetails = ({ event, setActiveTab }) => {
  // We don't need any values from AppContext for this component

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= event.maxTicketsPerBuyer) {
      setQuantity(value);
    }
  };

  const handlePurchase = async () => {
    // Reset messages
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      // Validate quantity
      if (quantity <= 0 || quantity > event.maxTicketsPerBuyer) {
        throw new Error(`You can purchase between 1 and ${event.maxTicketsPerBuyer} tickets`);
      }

      // Check if enough tickets are available
      if (event.ticketsSold + quantity > event.totalTickets) {
        throw new Error('Not enough tickets available');
      }

      // Create and upload metadata for each ticket
      const tokenURIs = [];
      for (let i = 0; i < quantity; i++) {
        const ticketNumber = event.ticketsSold + i + 1;

        // Create ticket metadata
        const metadata = createTicketMetadata(
          event.name,
          event.id,
          ticketNumber,
          event.date,
          `${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${event.ipfsImageHash}`
        );

        // Upload metadata to IPFS
        const metadataResult = await uploadMetadataToIPFS(metadata);
        tokenURIs.push(metadataResult.url);
      }

      // Purchase tickets
      const txHash = await purchaseTickets(
        event.id,
        quantity,
        tokenURIs,
        event.ticketPrice
      );

      setMessage(`Tickets purchased successfully! Transaction hash: ${txHash}`);

      // Reset quantity
      setQuantity(1);

      // Redirect to my tickets after 3 seconds
      setTimeout(() => {
        setActiveTab('my-tickets');
      }, 3000);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setError(error.message || 'Failed to purchase tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPassed = new Date(event.date) < new Date();
  const isSoldOut = event.ticketsSold >= event.totalTickets;
  const canPurchase = !isEventPassed && !isSoldOut && event.isActive;

  return (
    <div className="event-details-container">
      <button
        className="back-button"
        onClick={() => setActiveTab('events')}
      >
        &larr; Back to Events
      </button>

      <div className="event-details-content">
        <div className="event-image-container">
          <img
            src={`${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${event.ipfsImageHash}`}
            alt={event.name}
            className="event-detail-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://picsum.photos/seed/${event.id}/800/400`;
            }}
          />

          {!event.isActive && (
            <div className="event-cancelled-badge large">
              Cancelled
            </div>
          )}
        </div>

        <div className="event-info">
          <h1 className="event-title">{event.name}</h1>

          <div className="event-meta-info">
            <div className="event-date">
              <strong>Date:</strong> {formatDate(event.date)}
            </div>

            <div className="event-price">
              <strong>Price:</strong> {event.ticketPrice} ETH
            </div>

            <div className="event-availability">
              <strong>Availability:</strong> {event.ticketsSold} / {event.totalTickets} tickets sold
            </div>

            <div className="event-limit">
              <strong>Limit per buyer:</strong> {event.maxTicketsPerBuyer} tickets
            </div>

            <div className="event-transfer-policy">
              <strong>Transfer policy:</strong> {event.transferLocked ? 'Non-transferable' : 'Transferable'}
            </div>

            <div className="event-organizer">
              <strong>Organizer:</strong> {event.organizer.substring(0, 6)}...{event.organizer.substring(event.organizer.length - 4)}
            </div>
          </div>

          <div className="event-description">
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          {canPurchase ? (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={Math.min(event.maxTicketsPerBuyer, event.totalTickets - event.ticketsSold)}
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>

              <div className="total-price">
                Total: {(parseFloat(event.ticketPrice) * quantity).toFixed(4)} ETH
              </div>

              <button
                className="purchase-button"
                onClick={handlePurchase}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Purchase Tickets'}
              </button>
            </div>
          ) : (
            <div className="purchase-unavailable">
              {isEventPassed ? (
                <p>This event has already taken place.</p>
              ) : isSoldOut ? (
                <p>This event is sold out.</p>
              ) : !event.isActive ? (
                <p>This event has been cancelled.</p>
              ) : (
                <p>Tickets are not available for purchase.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
