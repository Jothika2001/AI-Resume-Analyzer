import React, { useState, useCallback } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_API_URL;

const UploadForm = ({ onAnalysisComplete, onError, onLoadingChange }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setFileError('File is too large. Maximum size is 5MB.');
      } else if (error.code === 'file-invalid-type') {
        setFileError('Only PDF files are allowed.');
      } else {
        setFileError(error.message);
      }
      setResumeFile(null);
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setResumeFile(file);
      setFileError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setFileError('Please upload a resume PDF file');
      return;
    }

    if (!jobDescription.trim()) {
      onError('Please enter a job description');
      return;
    }

    if (jobDescription.trim().length < 50) {
      onError('Job description seems too short. Please paste the full description (minimum 50 characters)');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    setUploading(true);
    onLoadingChange(true);

    try {
      const response = await axios.post(`${baseURL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      if (response.data.success) {
        onAnalysisComplete(response.data.analysis);
      } else {
        onError(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        onError('Request timeout. The analysis is taking longer than expected. Please try again.');
      } else if (error.response) {
        onError(error.response.data.error || 'Server error occurred');
      } else if (error.request) {
        onError('Cannot connect to server. Make sure the backend is running on port 5000');
      } else {
        onError('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setUploading(false);
      onLoadingChange(false);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    setFileError('');
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4 p-md-5">
        <Form onSubmit={handleSubmit}>
          {/* Resume Upload Section */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold fs-5 mb-3">
              📄 Upload Resume
            </Form.Label>
            <div
              {...getRootProps()}
              className={`dropzone p-4 text-center border rounded bg-light ${
                isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
              }`}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <input {...getInputProps()} />
              {resumeFile ? (
                <div>
                  <div className="text-success mb-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <p className="mb-1 fw-medium">{resumeFile.name}</p>
                  <p className="text-muted small mb-2">{(resumeFile.size / 1024).toFixed(2)} KB</p>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeFile(); 
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-secondary mb-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <p className="mb-0">
                    {isDragActive ? 'Drop your resume here' : 'Drag & drop or click to select'}
                  </p>
                  <p className="text-muted small mt-2">
                    PDF files only (max 5MB)
                  </p>
                </div>
              )}
            </div>
            {fileError && (
              <Alert variant="danger" className="mt-2 small py-2">
                {fileError}
              </Alert>
            )}
          </Form.Group>

          {/* Job Description Section */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold fs-5 mb-3">
              💼 Job Description
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={uploading}
              className="bg-light border"
              style={{ fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
            />
            <Form.Text className="text-muted">
              Minimum 50 characters for accurate analysis
            </Form.Text>
          </Form.Group>

          {/* Submit Button */}
          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={uploading || !resumeFile || !jobDescription.trim()}
              className="py-2 fw-semibold"
            >
              {uploading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Analyzing Resume...
                </>
              ) : (
                '🔍 Analyze Resume Match'
              )}
            </Button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-light border rounded">
            <small className="text-muted">
              <strong>ℹ️ How it works:</strong><br />
              1. Your resume is processed locally (no data leaves your computer)<br />
              2. The job description is compared using AI<br />
              3. You receive detailed match analysis and suggestions<br />
              <strong>Note:</strong> First analysis may take 30-40 seconds as models load.
            </small>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UploadForm;