import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

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
            Browse Events
          </button>
          
          {isOrganizer && (
            <button 
              className="cta-button secondary"
              onClick={() => setActiveTab('create-event')}
            >
              Create Event
            </button>
          )}
        </div>
      </div>
      
      <div className="features-section">
        <h2>Platform Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎫</div>
            <h3>NFT Tickets</h3>
            <p>Each ticket is a unique NFT with verifiable ownership and authenticity.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Anti-Scalping</h3>
            <p>Smart contract enforces rules to prevent ticket scalping and price gouging.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Easy Verification</h3>
            <p>Event organizers can quickly verify ticket authenticity and attendance.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
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
          <button 
            className="action-button"
            onClick={() => setActiveTab('events')}
          >
            Browse Events
          </button>
          <button 
            className="action-button secondary"
            onClick={() => setActiveTab('my-tickets')}
          >
            My Tickets
          </button>
        </div>
        
        <div className="action-card">
          <h3>For Event Organizers</h3>
          <p>Create events, manage ticket sales, and verify attendees.</p>
          {isOrganizer ? (
            <>
              <button 
                className="action-button"
                onClick={() => setActiveTab('create-event')}
              >
                Create Event
              </button>
              <button 
                className="action-button secondary"
                onClick={() => setActiveTab('verify-ticket')}
              >
                Verify Tickets
              </button>
            </>
          ) : isOwner ? (
            <button 
              className="action-button"
              onClick={() => setActiveTab('register-organizer')}
            >
              Register Organizers
            </button>
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
