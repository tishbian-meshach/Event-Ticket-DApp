import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { getAllEvents } from '../utils/contractUtils';

const EventList = ({ setActiveTab, setSelectedEvent }) => {
  const { account } = useContext(AppContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

  const applyFilters = useCallback((eventList = events) => {
    const now = new Date();

    let filtered = [...eventList];

    // Apply date filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) > now);
    } else if (filter === 'past') {
      filtered = filtered.filter(event => new Date(event.date) <= now);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchTerm]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const allEvents = await getAllEvents();

      // Sort events by date (newest first)
      const sortedEvents = allEvents.sort((a, b) => a.date - b.date);

      setEvents(sortedEvents);
      // Use the current value of sortedEvents directly instead of calling applyFilters
      const now = new Date();
      let filtered = [...sortedEvents];

      if (filter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.date) > now);
      } else if (filter === 'past') {
        filtered = filtered.filter(event => new Date(event.date) <= now);
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(event =>
          event.name.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term)
        );
      }

      setFilteredEvents(filtered);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    if (account) {
      fetchEvents();
    }
  }, [account, fetchEvents]);

  useEffect(() => {
    if (events.length > 0) {
      applyFilters();
    }
  }, [events, searchTerm, filter, applyFilters]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setActiveTab('event-details');
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
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="events-container">
      <h2 className="section-title">Browse Events</h2>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search events..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <select
          className="filter-select"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Events</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events-message">
          <p>No events found.</p>
          {filter === 'upcoming' && (
            <button
              className="cta-button"
              onClick={() => setActiveTab('create-event')}
            >
              Create an Event
            </button>
          )}
        </div>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => handleEventClick(event)}
            >
              <div className="event-image-container">
                <img
                  src={`${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${event.ipfsImageHash}`}
                  alt={event.name}
                  className="event-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${event.id}/400/200`;
                  }}
                />

                <div className="event-date-badge">
                  {formatDate(event.date)}
                </div>

                {!event.isActive && (
                  <div className="event-cancelled-badge">
                    Cancelled
                  </div>
                )}
              </div>

              <div className="event-details">
                <h3 className="event-name">{event.name}</h3>

                <p className="event-description">
                  {event.description.length > 100
                    ? `${event.description.substring(0, 100)}...`
                    : event.description}
                </p>

                <div className="event-meta">
                  <span className="event-price">{event.ticketPrice} ETH</span>
                  <span className="event-tickets">
                    {event.ticketsSold} / {event.totalTickets} tickets sold
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
