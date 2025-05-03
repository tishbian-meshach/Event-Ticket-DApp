import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { registerOrganizer, getOrganizerDetails, getAllOrganizers } from '../utils/contractUtils';
import {
  Users,
  UserPlus,
  RefreshCw,
  ArrowLeft,
  Mail,
  Globe,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  List
} from 'lucide-react';

const OrganizerRegistration = () => {
  const { account, isOwner, isOrganizer, checkUserRole } = useContext(AppContext);

  // Registration form state
  const [organizerAddress, setOrganizerAddress] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerWebsite, setOrganizerWebsite] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showOrganizersList, setShowOrganizersList] = useState(false);

  // Organizer profile state
  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Organizers list state
  const [organizers, setOrganizers] = useState([]);
  const [isLoadingOrganizers, setIsLoadingOrganizers] = useState(false);

  // Fetch organizer profile if the user is registered
  const fetchOrganizerProfile = useCallback(async () => {
    if (!account) return;

    setIsLoadingProfile(true);
    try {
      // Use the isOrganizer state from context instead of making another call
      if (isOrganizer) {
        console.log('User is a registered organizer, fetching profile details');
        try {
          const details = await getOrganizerDetails(account);
          console.log('Organizer profile details:', details);

          // Ensure we have a valid object with at least some default properties
          if (details && typeof details === 'object') {
            setOrganizerProfile({
              name: details.name || 'Unknown',
              email: details.email || '',
              website: details.website || '',
              registrationDate: details.registrationDate || new Date().toISOString(),
              ...details
            });
          } else {
            console.warn('Invalid profile details received:', details);
            // Set default profile if details are invalid
            setOrganizerProfile({
              name: 'Unknown',
              email: '',
              website: '',
              registrationDate: new Date().toISOString()
            });
          }
        } catch (detailsError) {
          console.error('Error fetching organizer details:', detailsError);
          // Set default profile on error
          setOrganizerProfile({
            name: 'Unknown',
            email: '',
            website: '',
            registrationDate: new Date().toISOString()
          });
        }
      } else {
        console.log('User is not a registered organizer');
        setOrganizerProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchOrganizerProfile:', error);
      // Set default profile on error
      setOrganizerProfile({
        name: 'Error loading profile',
        email: '',
        website: '',
        registrationDate: new Date().toISOString()
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [account, isOrganizer]);

  // Fetch all organizers
  const fetchAllOrganizers = useCallback(async () => {
    if (!showOrganizersList) return;

    setIsLoadingOrganizers(true);
    try {
      const allOrganizers = await getAllOrganizers();
      setOrganizers(allOrganizers);
    } catch (error) {
      console.error('Error fetching organizers:', error);
      setError('Failed to load organizers. Please try again later.');
    } finally {
      setIsLoadingOrganizers(false);
    }
  }, [showOrganizersList]);

  // Load organizer profile when account or isOrganizer changes
  useEffect(() => {
    console.log('Account or isOrganizer changed, fetching profile. isOrganizer:', isOrganizer);
    fetchOrganizerProfile();
  }, [account, isOrganizer, fetchOrganizerProfile]);

  // Load organizers list when showOrganizersList changes
  useEffect(() => {
    fetchAllOrganizers();
  }, [showOrganizersList, fetchAllOrganizers]);

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
      // Create organizer details object
      const organizerDetails = {
        name: organizerName,
        email: organizerEmail,
        website: organizerWebsite,
        registrationDate: new Date().toISOString()
      };

      // Use the dedicated registerOrganizer function with gas price handling
      const txHash = await registerOrganizer(organizerAddress, organizerDetails);

      setMessage(`Organizer registered successfully! Transaction hash: ${txHash}`);

      // Reset form
      setOrganizerAddress('');
      setOrganizerName('');
      setOrganizerEmail('');
      setOrganizerWebsite('');

      // Refresh user role if the registered address is the current user
      checkUserRole();

      // Refresh organizer profile if the registered address is the current user
      if (organizerAddress.toLowerCase() === account.toLowerCase()) {
        fetchOrganizerProfile();
      }

      // Refresh organizers list if it's visible
      if (showOrganizersList) {
        fetchAllOrganizers();
      }
    } catch (error) {
      console.error('Error registering organizer:', error);
      setError(error.message || 'Failed to register organizer');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // We've removed the render functions and integrated them directly into the component

  // Main component render
  if (!account) {
    return (
      <div className="form-container">
        <h2 className="form-title">Organizer Registration</h2>
        <p className="connect-wallet-message">Please connect your wallet to view this page.</p>
      </div>
    );
  }

  // If the current user is already an organizer, show their profile
  // Only show if isOrganizer is true and we're not showing the registration form
  if (isOrganizer && !showRegistrationForm) {
    console.log("Showing organizer profile. Profile data:", organizerProfile);
    return (
      <div className="profile-container">
        <div className="profile-header-centered">
          <h2 className="form-title-centered">
            <span>Your Organizer Profile</span>
          </h2>
        </div>

        <div className="profile-actions-centered">
          {isOwner && (
            <button
              className="action-button"
              onClick={() => {
                setOrganizerAddress('');
                setShowRegistrationForm(true);
              }}
            >
              <UserPlus size={18} />
              <span>Register New Organizer</span>
            </button>
          )}
          <button
            className={`action-button ${showOrganizersList ? 'secondary' : ''}`}
            onClick={() => setShowOrganizersList(!showOrganizersList)}
          >
            <List size={18} />
            <span>{showOrganizersList ? 'Hide Organizers' : 'Manage Organizers'}</span>
          </button>
        </div>

        {message && (
          <div className="success-message">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {isLoadingProfile ? (
          <div className="loading">
            <RefreshCw size={20} className="spin-icon" />
            <span>Loading your organizer details...</span>
          </div>
        ) : organizerProfile ? (
          <div className="organizer-profile">
            <div className="profile-details">
              <div className="detail-row">
                <div className="detail-label">
                  <User size={16} style={{marginRight:"7px"}} />
                  <span>Name</span>
                </div>
                <div className="detail-value">{organizerProfile.name || 'Not provided'}</div>
              </div>

              {organizerProfile.email && (
                <div className="detail-row">
                  <div className="detail-label">
                    <Mail size={16} style={{marginRight:"7px"}}/>
                    <span>Email</span>
                  </div>
                  <div className="detail-value">{organizerProfile.email}</div>
                </div>
              )}

              {organizerProfile.website && (
                <div className="detail-row">
                  <div className="detail-label">
                    <Globe size={16} style={{marginRight:"7px"}}/>
                    <span>Website</span>
                  </div>
                  <div className="detail-value">
                    <a href={organizerProfile.website} target="_blank" rel="noopener noreferrer">
                      {organizerProfile.website}
                    </a>
                  </div>
                </div>
              )}

              <div className="detail-row">
                <div className="detail-label">
                  <Calendar size={16} style={{marginRight:"7px"}}/>
                  <span>Registered</span>
                </div>
                <div className="detail-value">{organizerProfile.registrationDate ? formatDate(organizerProfile.registrationDate) : 'Unknown'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="loading">
            <AlertTriangle size={20} />
            <span>No profile data available. Please refresh the page.</span>
          </div>
        )}

        {/* Manage Organizers section */}
        {showOrganizersList && (
          <div className="organizers-list-container">
            <div className="list-header">
              <h3>
                <Users size={24} strokeWidth={1.5} />
                <span>Registered Organizers</span>
              </h3>
              <button
                className="action-button refresh"
                onClick={fetchAllOrganizers}
              >
                <RefreshCw size={18} />
                <span>Refresh List</span>
              </button>
            </div>

            {isLoadingOrganizers ? (
              <div className="loading">
                <RefreshCw size={20} className="spin-icon" />
                <span>Loading organizers...</span>
              </div>
            ) : organizers.length === 0 ? (
              <div className="no-organizers-message">
                <AlertTriangle size={24} />
                <p>No organizers registered yet.</p>
              </div>
            ) : (
              <div className="organizers-list">
                {organizers.map((organizer, index) => (
                  <div key={index} className="organizer-item">
                    <div className="organizer-name">
                      <User size={20} strokeWidth={1.5} />
                      <span>{organizer.name || 'Unknown'}</span>
                    </div>
                    <div className="organizer-address">{organizer.address}</div>
                    <div className="organizer-details">
                      {organizer.email && (
                        <div className="organizer-detail">
                          <Mail size={16} strokeWidth={1.5} />
                          <span>{organizer.email}</span>
                        </div>
                      )}
                      {organizer.website && (
                        <div className="organizer-detail">
                          <Globe size={16} strokeWidth={1.5} />
                          <a href={organizer.website} target="_blank" rel="noopener noreferrer">
                            {organizer.website}
                          </a>
                        </div>
                      )}
                      <div className="organizer-detail">
                        <Calendar size={16} strokeWidth={1.5} />
                        <span>{formatDate(organizer.registrationDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // If user is not the owner and not an organizer, show message
  if (!isOwner && !isOrganizer) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">
            <Users size={24} className="section-icon" />
            <span>Organizer Registration</span>
          </h2>
          <button
            className="action-button refresh"
            onClick={async () => {
              console.log("Force refreshing user role...");
              await checkUserRole();
              console.log("User role refreshed - isOwner:", isOwner, "isOrganizer:", isOrganizer);
            }}
          >
            <RefreshCw size={18} />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="not-registered-message">
          <AlertTriangle size={24} className="not-registered-icon" />
          <p>Only the contract owner can register new organizers.</p>
          <p className="note">Please contact the platform administrator if you wish to become a registered organizer.</p>
        </div>
      </div>
    );
  }

  // Default view for owner to register new organizers
  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          <span>Register New Organizer</span>
        </h2>
        {isOrganizer && (
          <button
            className="action-button secondary"
            onClick={() => {
              console.log("Going back to organizer profile");
              setShowRegistrationForm(false);
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to Profile</span>
          </button>
        )}
      </div>

      {message && (
        <div className="success-message">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="organizerAddress">
            <User size={16} className="form-icon" />
            <span>Organizer Wallet Address</span>
          </label>
          <input
            type="text"
            id="organizerAddress"
            value={organizerAddress}
            onChange={(e) => setOrganizerAddress(e.target.value)}
            placeholder="0x..."
            required
          />
          <small>Enter the Ethereum address of the organizer</small>
        </div>

        <div className="form-group">
          <label htmlFor="organizerName">
            <User size={16} className="form-icon" />
            <span>Organizer Name</span>
          </label>
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
          <label htmlFor="organizerEmail">
            <Mail size={16} className="form-icon" />
            <span>Email (Optional)</span>
          </label>
          <input
            type="email"
            id="organizerEmail"
            value={organizerEmail}
            onChange={(e) => setOrganizerEmail(e.target.value)}
            placeholder="contact@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizerWebsite">
            <Globe size={16} className="form-icon" />
            <span>Website (Optional)</span>
          </label>
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
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spin-icon" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Register Organizer</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OrganizerRegistration;
