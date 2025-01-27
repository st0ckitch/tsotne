import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as THREE from 'three';

// Configure THREE.js
THREE.ColorManagement.enabled = false;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
