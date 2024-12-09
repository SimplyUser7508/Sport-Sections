import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './Context/Auth';

const domNode = document.getElementById('root');

if (!domNode) {
  throw new Error("Cannot find root element with id 'root'");
}

const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
