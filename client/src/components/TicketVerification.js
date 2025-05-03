import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getTicketDetails, getEventDetails, useTicket as markTicketAsUsed } from '../utils/contractUtils';

const TicketVerification = () => {
  const { isOrganizer, isOwner } = useContext(AppContext);

  const [tokenId, setTokenId] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();

    // Reset states
    setTicketDetails(null);
    setEventDetails(null);
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      // Validate token ID
      if (!tokenId || isNaN(parseInt(tokenId))) {
        throw new Error('Please enter a valid ticket ID');
      }

      // Get ticket details
      const ticket = await getTicketDetails(tokenId);
      setTicketDetails(ticket);

      // Get event details
      const event = await getEventDetails(ticket.eventId);
      setEventDetails(event);
    } catch (error) {
      console.error('Error verifying ticket:', error);
      setError(error.message || 'Failed to verify ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsUsed = async () => {
    setIsVerifying(true);
    setMessage('');
    setError('');

    try {
      // Mark ticket as used
      const txHash = await markTicketAsUsed(tokenId);

      // Update ticket details
      setTicketDetails({
        ...ticketDetails,
        isUsed: true
      });

      setMessage(`Ticket marked as used successfully! Transaction hash: ${txHash}`);
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setError(error.message || 'Failed to mark ticket as used');
    } finally {
      setIsVerifying(false);
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

  if (!isOrganizer && !isOwner) {
    return (
      <div className="form-container">
        <h2 className="form-title">Ticket Verification</h2>
        <p className="error-message">Only event organizers and the contract owner can verify tickets.</p>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <h2 className="section-title">Ticket Verification</h2>

      <form onSubmit={handleVerify} className="verification-form">
        <div className="form-group">
          <label htmlFor="tokenId">Ticket ID</label>
          <input
            type="number"
            id="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter ticket ID"
            required
          />
        </div>

        <button
          type="submit"
          className="verify-button"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify Ticket'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {ticketDetails && eventDetails && (
        <div className="verification-result">
          <h3 className="result-title">Ticket Information</h3>

          <div className="result-card">
            <div className="result-status">
              <div className={`status-badge ${ticketDetails.isUsed ? 'used' : 'valid'}`}>
                {ticketDetails.isUsed ? 'USED' : 'VALID'}
              </div>
            </div>

            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{eventDetails.name}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Event Date:</span>
                <span className="detail-value">{formatDate(eventDetails.date)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Ticket #:</span>
                <span className="detail-value">{ticketDetails.ticketNumber}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Original Buyer:</span>
                <span className="detail-value">
                  {ticketDetails.originalBuyer.substring(0, 6)}...{ticketDetails.originalBuyer.substring(ticketDetails.originalBuyer.length - 4)}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Purchase Date:</span>
                <span className="detail-value">{formatDate(ticketDetails.purchaseDate)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Purchase Price:</span>
                <span className="detail-value">{ticketDetails.purchasePrice} ETH</span>
              </div>
            </div>

            {!ticketDetails.isUsed && (
              <div className="result-actions">
                <button
                  className="use-ticket-button"
                  onClick={handleMarkAsUsed}
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Processing...' : 'Mark as Used'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketVerification;
