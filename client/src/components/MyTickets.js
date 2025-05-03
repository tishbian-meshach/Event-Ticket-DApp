import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { getUserTickets, getTokenURI } from '../utils/contractUtils';

const MyTickets = () => {
  const { account } = useContext(AppContext);

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [filteredTickets, setFilteredTickets] = useState([]);

  const applyFilters = useCallback((ticketList = tickets) => {
    const now = new Date();

    let filtered = [...ticketList];

    // Apply date filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(ticket => new Date(ticket.eventDate) > now);
    } else if (filter === 'past') {
      filtered = filtered.filter(ticket => new Date(ticket.eventDate) <= now);
    }

    setFilteredTickets(filtered);
  }, [tickets, filter]);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const userTickets = await getUserTickets();

      // Fetch metadata for each ticket
      const ticketsWithMetadata = await Promise.all(
        userTickets.map(async (ticket) => {
          try {
            const uri = await getTokenURI(ticket.tokenId);
            let metadata = {};

            try {
              const response = await fetch(uri);
              metadata = await response.json();
            } catch (metadataError) {
              console.error(`Error fetching metadata for ticket ${ticket.tokenId}:`, metadataError);
              metadata = {
                name: `Ticket #${ticket.ticketNumber} for Event #${ticket.eventId}`,
                image: '',
                description: ''
              };
            }

            return {
              ...ticket,
              metadata
            };
          } catch (error) {
            console.error(`Error processing ticket ${ticket.tokenId}:`, error);
            return ticket;
          }
        })
      );

      // Sort tickets by event date (upcoming first)
      const sortedTickets = ticketsWithMetadata.sort((a, b) => a.eventDate - b.eventDate);

      setTickets(sortedTickets);

      // Apply filters directly instead of calling applyFilters
      const now = new Date();
      let filtered = [...sortedTickets];

      if (filter === 'upcoming') {
        filtered = filtered.filter(ticket => new Date(ticket.eventDate) > now);
      } else if (filter === 'past') {
        filtered = filtered.filter(ticket => new Date(ticket.eventDate) <= now);
      }

      setFilteredTickets(filtered);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (account) {
      fetchTickets();
    }
  }, [account, fetchTickets]);

  useEffect(() => {
    if (tickets.length > 0) {
      applyFilters();
    }
  }, [tickets, filter, applyFilters]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="loading">Loading your tickets...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="no-tickets-message">
        <h2>My Tickets</h2>
        <p>You don't have any tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="my-tickets-container">
      <h2 className="section-title">My Tickets</h2>

      <div className="filter-bar">
        <select
          className="filter-select"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Tickets</option>
        </select>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="no-tickets-message">
          <p>No tickets found for the selected filter.</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {filteredTickets.map((ticket) => (
            <div key={ticket.tokenId} className="ticket-card">
              <div className="ticket-image-container">
                <img
                  src={ticket.metadata?.image || `https://picsum.photos/seed/${ticket.tokenId}/400/200`}
                  alt={ticket.metadata?.name || `Ticket #${ticket.ticketNumber}`}
                  className="ticket-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${ticket.tokenId}/400/200`;
                  }}
                />

                {ticket.isUsed && (
                  <div className="ticket-used-badge">
                    Used
                  </div>
                )}
              </div>

              <div className="ticket-details">
                <h3 className="ticket-name">
                  {ticket.metadata?.name || `Ticket #${ticket.ticketNumber} for ${ticket.eventName}`}
                </h3>

                <div className="ticket-meta">
                  <div className="ticket-event">
                    <strong>Event:</strong> {ticket.eventName}
                  </div>

                  <div className="ticket-date">
                    <strong>Date:</strong> {formatDate(ticket.eventDate)}
                  </div>

                  <div className="ticket-number">
                    <strong>Ticket #:</strong> {ticket.ticketNumber}
                  </div>

                  <div className="ticket-purchase-date">
                    <strong>Purchased:</strong> {formatDate(ticket.purchaseDate)}
                  </div>

                  <div className="ticket-price">
                    <strong>Price:</strong> {ticket.purchasePrice} ETH
                  </div>
                </div>

                <div className="ticket-actions">
                  <button
                    className="ticket-action-button"
                    onClick={() => window.print()}
                  >
                    Print Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
