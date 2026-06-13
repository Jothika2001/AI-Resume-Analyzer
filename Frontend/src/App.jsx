import React, { useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import UploadForm from './components/UploadForm';
import Results from './components/Results';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysis(data);
    setLoading(false);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
    setAnalysis(null);
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="app">
      <Container fluid className="py-4 py-md-5">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Header Section */}
            <div className="header-section text-center mb-4 mb-md-5">
              <div className="brand-mark mb-3">RESUME INTELLIGENCE</div>
              <h1 className="app-title mb-3">
                AI Resume Analyzer
              </h1>
              <p className="app-subtitle text-secondary mb-4">
                Evaluate resume-to-job alignment with semantic AI analysis
              </p>

              {/* Tech Stack Badges */}
              <div className="tech-stack">
                <div className="tech-badge">
                  <span className="tech-name">ChromaDB</span>
                  <span className="tech-divider">·</span>
                  <span className="tech-version">Vector Database</span>
                </div>
                <div className="tech-badge">
                  <span className="tech-name">Gemini AI</span>
                  <span className="tech-divider">·</span>
                  <span className="tech-version">LLM Processing</span>
                </div>
                <div className="tech-badge">
                  <span className="tech-name">RAG Architecture</span>
                  <span className="tech-divider">·</span>
                  <span className="tech-version">Semantic Search</span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(null)}
                dismissible
                className="custom-alert error-alert mb-4"
              >
                <div className="d-flex align-items-start">
                  <div className="alert-icon me-3" aria-hidden="true" />
                  <div>
                    <Alert.Heading className="fs-6 fw-semibold mb-1">Analysis Failed</Alert.Heading>
                    <p className="mb-0 small">{error}</p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Main Content Cards */}
            <div className="main-content">
              {!analysis ? (
                <UploadForm
                  onAnalysisComplete={handleAnalysisComplete}
                  onError={handleError}
                  onLoadingChange={setLoading}
                />
              ) : (
                <Results analysis={analysis} onReset={handleReset} />
              )}
            </div>

            {/* Loading Overlay */}
            <LoadingOverlay loading={loading} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;