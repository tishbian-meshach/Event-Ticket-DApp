import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getTicketDetails, getEventDetails, useTicket as markTicketAsUsed } from '../utils/contractUtils';
import { Search, CheckCircle, AlertTriangle, Calendar, Clock, User, DollarSign, Ticket } from 'lucide-react';

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
        <h2 className="verification-title">Ticket Verification</h2>
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>Only event organizers and the contract owner can verify tickets.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <h2 className="verification-title">Ticket Verification</h2>
      <p className="verification-subtitle">Scan or enter ticket ID to verify authenticity and attendance</p>

      <form onSubmit={handleVerify} className="verification-form">
        <div className="verification-input-row">
          <div className="form-group verification-input">
            <label htmlFor="tokenId">Ticket ID</label>
            <div className="input-with-icon">
              <input
                type="number"
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter ticket ID"
                required
              />
              <Ticket size={18} className="input-icon" />
            </div>
          </div>

          <button
            type="submit"
            className="verify-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span>Verifying...</span>
                <Search size={18} className="spin-icon" />
              </>
            ) : (
              <>
                <span>Verify Ticket</span>
                <Search size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {error && <div className="error-message"><AlertTriangle size={18} /><span>{error}</span></div>}
      {message && <div className="success-message"><CheckCircle size={18} /><span>{message}</span></div>}

      {ticketDetails && eventDetails && (
        <div className="verification-result">
          <h3 className="verification-result-title">Ticket Information</h3>

          <div className="result-card">
            <div className="result-status">
              <div className={`status-badge ${ticketDetails.isUsed ? 'used' : 'valid'}`}>
                {ticketDetails.isUsed ? (
                  <>
                    <AlertTriangle size={20} />
                    <span>USED</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>VALID</span>
                  </>
                )}
              </div>
            </div>

            <div className="result-details">
              <div className="result-detail-row">
                <div className="result-detail-label">
                  <Calendar size={16} />
                  <span>Event</span>
                </div>
                <div className="result-detail-value">{eventDetails.name}</div>
              </div>

              <div className="result-detail-row">
                <div className="result-detail-label">
                  <Clock size={16} />
                  <span>Event Date</span>
                </div>
                <div className="result-detail-value">{formatDate(eventDetails.date)}</div>
              </div>

              <div className="result-detail-row">
                <div className="result-detail-label">
                  <Ticket size={16} />
                  <span>Ticket #</span>
                </div>
                <div className="result-detail-value">{ticketDetails.ticketNumber}</div>
              </div>

              <div className="result-detail-row">
                <div className="result-detail-label">
                  <User size={16} />
                  <span>Original Buyer</span>
                </div>
                <div className="result-detail-value">
                  {ticketDetails.originalBuyer.substring(0, 6)}...{ticketDetails.originalBuyer.substring(ticketDetails.originalBuyer.length - 4)}
                </div>
              </div>

              <div className="result-detail-row">
                <div className="result-detail-label">
                  <Calendar size={16} />
                  <span>Purchase Date</span>
                </div>
                <div className="result-detail-value">{formatDate(ticketDetails.purchaseDate)}</div>
              </div>

              <div className="result-detail-row">
                <div className="result-detail-label">
                  <DollarSign size={16} />
                  <span>Purchase Price</span>
                </div>
                <div className="result-detail-value">{ticketDetails.purchasePrice} ETH</div>
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
                  <CheckCircle size={18} />
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
