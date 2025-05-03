import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from './context/AppContext';

// Contract address from environment variable
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

// Validate that the contract address is available
if (!CONTRACT_ADDRESS) {
  console.error('Contract address not found in environment variables. Please check your .env file.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider contractAddress={CONTRACT_ADDRESS}>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
