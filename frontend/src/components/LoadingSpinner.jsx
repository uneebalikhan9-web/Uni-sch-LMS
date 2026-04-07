import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading Spinner Component
 * 
 * @param {boolean} fullPage - If true, show as full-screen overlay
 * @param {string} size - size of spinner (small, medium, large)
 * @param {string} color - CSS color for the spinner
 */
const LoadingSpinner = ({ fullPage = false, size = 'medium', color = '#4f46e5' }) => {
  const sizeMap = {
    small: '24px',
    medium: '48px',
    large: '72px'
  };

  const spinnerStyle = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: `3px solid rgba(0, 0, 0, 0.05)`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%'
  };

  if (fullPage) {
    return (
      <div className="spinner-overlay" aria-busy="true" aria-live="polite">
        <div className="spinner-wrapper">
          <div className="spinner-circle" style={spinnerStyle}></div>
          <p className="spinner-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-inline" aria-busy="true" aria-live="polite">
      <div className="spinner-circle" style={spinnerStyle}></div>
    </div>
  );
};

export default LoadingSpinner;
