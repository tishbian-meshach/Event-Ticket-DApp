import React, { useState, useContext } from 'react';
import './App.css';
import { AppContext } from './context/AppContext';
import { switchToSepoliaNetwork } from './utils/contractUtils';
import WalletConnection from './components/WalletConnection';
import OrganizerRegistration from './components/OrganizerRegistration';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import MyTickets from './components/MyTickets';
import TicketVerification from './components/TicketVerification';
import HomePage from './components/HomePage';

function App() {
  const {
    account,
    isOwner,
    isOrganizer,
    isLoading,
    error,
    isWrongNetwork,
    handleAccountChange
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepoliaNetwork();
      window.location.reload(); // Reload the page after switching networks
    } catch (error) {
      console.error('Error switching network:', error);
      alert('Failed to switch to Sepolia network. Please try manually switching in MetaMask.');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Handle accounts
        if (accounts.length > 0) {
          handleAccountChange(accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return (
        <div className="message error-message">
          {error}
          {isWrongNetwork && (
            <button
              onClick={handleSwitchNetwork}
              className="connect-button"
              style={{ marginTop: '1rem' }}
            >
              Switch to Sepolia Network
            </button>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'events':
        return <EventList setActiveTab={setActiveTab} setSelectedEvent={setSelectedEvent} />;
      case 'event-details':
        return selectedEvent ? (
          <EventDetails event={selectedEvent} setActiveTab={setActiveTab} />
        ) : (
          <div className="error-message">No event selected. <button onClick={() => setActiveTab('events')}>Browse Events</button></div>
        );
      case 'create-event':
        return <EventForm setActiveTab={setActiveTab} />;
      case 'register-organizer':
        return <OrganizerRegistration />;
      case 'my-tickets':
        return <MyTickets />;
      case 'verify-ticket':
        return <TicketVerification />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo" onClick={() => setActiveTab('home')}>
          Event Ticket DApp
        </div>
        
        {account && (
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'my-tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-tickets')}
            >
              My Tickets
            </button>
            
            {isOrganizer && (
              <>
                <button 
                  className={`nav-item ${activeTab === 'create-event' ? 'active' : ''}`}
                  onClick={() => setActiveTab('create-event')}
                >
                  Create Event
                </button>
                
                <button 
                  className={`nav-item ${activeTab === 'verify-ticket' ? 'active' : ''}`}
                  onClick={() => setActiveTab('verify-ticket')}
                >
                  Verify Tickets
                </button>
              </>
            )}
            
            {isOwner && (
              <button 
                className={`nav-item ${activeTab === 'register-organizer' ? 'active' : ''}`}
                onClick={() => setActiveTab('register-organizer')}
              >
                Register Organizer
              </button>
            )}
          </nav>
        )}
        
        <WalletConnection />
      </header>

      <main className="App-main">
        {account ? renderContent() : (
          <div className="home-container">
            <div className="hero-section">
              <h1>Decentralized Event Ticketing</h1>
              <p>
                A secure and transparent way to buy, sell, and verify event tickets using blockchain technology.
                Our platform prevents ticket scalping and counterfeiting through NFT-based tickets.
              </p>
              <button className="cta-button" onClick={connectWallet}>Connect Wallet</button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Event Ticket DApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
