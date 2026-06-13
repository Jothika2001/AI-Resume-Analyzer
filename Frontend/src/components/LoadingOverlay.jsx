import React from 'react';

const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h5 className="mb-2 fw-semibold">Analyzing Your Resume</h5>
        <p className="text-secondary small mb-3">Using ChromaDB + Gemini AI</p>
        <div className="progress" style={{ height: '4px' }}>
          <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div>
        </div>
        <p className="text-muted small mt-3 mb-0">
          Retrieving relevant chunks • Generating embeddings • Processing with LLM
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;