import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Calendar,
  Ticket,
  PlusCircle,
  CheckCircle,
  Shield,
  RefreshCw,
  Users
} from 'lucide-react';

const HomePage = ({ setActiveTab }) => {
  const { isOrganizer, isOwner } = useContext(AppContext);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Decentralized Event Ticketing</h1>
        <p>
          A secure and transparent way to buy, sell, and verify event tickets using blockchain technology.
          Our platform prevents ticket scalping and counterfeiting through NFT-based tickets.
        </p>
        <div className="cta-buttons">
          <button
            className="cta-button primary"
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={20} />
            <span>Browse Events</span>
          </button>

          {isOrganizer && (
            <button
              className="cta-button secondary"
              onClick={() => setActiveTab('create-event')}
            >
              <PlusCircle size={20} />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Platform Features</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Ticket size={36} />
            </div>
            <h3>NFT Tickets</h3>
            <p>Each ticket is a unique NFT with verifiable ownership and authenticity.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={36} />
            </div>
            <h3>Anti-Scalping</h3>
            <p>Smart contract enforces rules to prevent ticket scalping and price gouging.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <CheckCircle size={36} />
            </div>
            <h3>Easy Verification</h3>
            <p>Event organizers can quickly verify ticket authenticity and attendance.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <RefreshCw size={36} />
            </div>
            <h3>Transparent Transfers</h3>
            <p>All ticket transfers are recorded on the blockchain for complete transparency.</p>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <h2>How It Works</h2>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Event Creation</h3>
            <p>Organizers create events and set ticket parameters including anti-scalping rules.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Ticket Purchase</h3>
            <p>Attendees purchase tickets which are minted as NFTs and transferred to their wallet.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Ticket Management</h3>
            <p>Tickets can be viewed in the app and are subject to the transfer rules set by organizers.</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Event Check-in</h3>
            <p>Organizers verify ticket authenticity and mark tickets as used upon entry.</p>
          </div>
        </div>
      </div>

      <div className="action-cards-section">
        <div className="action-card">
          <h3>For Event Attendees</h3>
          <p>Browse events, purchase tickets, and manage your ticket collection.</p>
          <div className="action-buttons">
            <button
              className="action-button"
              onClick={() => setActiveTab('events')}
            >
              <Calendar size={18} />
              <span>Browse Events</span>
            </button>
            <button
              className="action-button secondary"
              onClick={() => setActiveTab('my-tickets')}
            >
              <Ticket size={18} />
              <span>My Tickets</span>
            </button>
          </div>
        </div>

        <div className="action-card">
          <h3>For Event Organizers</h3>
          <p>Create events, manage ticket sales, and verify attendees.</p>
          {isOrganizer ? (
            <div className="action-buttons">
              <button
                className="action-button"
                onClick={() => setActiveTab('create-event')}
              >
                <PlusCircle size={18} />
                <span>Create Event</span>
              </button>
              <button
                className="action-button secondary"
                onClick={() => setActiveTab('verify-ticket')}
              >
                <CheckCircle size={18} />
                <span>Verify Tickets</span>
              </button>
            </div>
          ) : isOwner ? (
            <div className="action-buttons">
              <button
                className="action-button"
                onClick={() => setActiveTab('register-organizer')}
              >
                <Users size={18} />
                <span>Register Organizers</span>
              </button>
            </div>
          ) : (
            <p className="note">
              Contact the platform administrator to become a registered organizer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
