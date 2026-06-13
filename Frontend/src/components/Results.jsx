import React from 'react';
import { Card, Button, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const Results = ({ analysis, onReset }) => {
  // Enhanced score extraction for various formats
  const extractMatchScore = (text) => {
    const patterns = [
      /(?:Match|MATCH)\s+Score\s*[:\-]\s*(\d{1,3})%/i,
      /##\s*Match\s+Score\s*\n\s*(\d{1,3})/i,
      /(\d{1,3})%\s*Match/i,
      /Score\s*[:\-]\s*(\d{1,3})%/i,
      /(\d{1,3})\s*\/\s*100/i,
      /(\d{1,3})\s*out\s*of\s*100/i,
      /##\s*Match\s*Score[^\n]*\n\s*(\d{1,3})/i,
      /\[(\d{1,3})%\]/i,
      /(\d{1,3})\s*percent/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1]);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          return score;
        }
      }
    }

    const anyNumberMatch = text.match(/\b([5-9][0-9]|100)\b/);
    if (anyNumberMatch) {
      const possibleScore = parseInt(anyNumberMatch[1]);
      if (possibleScore >= 50 && possibleScore <= 100) {
        return possibleScore;
      }
    }

    return null;
  };

  // Parse analysis into sections
  const parseAnalysis = (text) => {
    const sections = {
      strengths: [],
      missingSkills: [],
      missingKeywords: [],
      improvements: [],
      recommendations: []
    };

    const strengthsMatch = text.match(/(?:##\s*)?Strengths?\s*\n([\s\S]*?)(?=\n(?:##|\*\*|Improvements|Missing|Recommendations)|$)/i);
    if (strengthsMatch) {
      sections.strengths = strengthsMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-•*\d+\.]\s*/, '').trim())
        .filter(item => item.length > 0 && item.length < 200);
    }

    const missingSkillsMatch = text.match(/(?:##\s*)?Missing\s*Skills?\s*\n([\s\S]*?)(?=\n(?:##|\*\*|Strengths|Keywords|Improvements)|$)/i);
    if (missingSkillsMatch) {
      sections.missingSkills = missingSkillsMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-•*\d+\.]\s*/, '').trim())
        .filter(item => item.length > 0 && item.length < 200);
    }

    const missingKeywordsMatch = text.match(/(?:##\s*)?Missing\s*Keywords?\s*\n([\s\S]*?)(?=\n(?:##|\*\*|Skills|Improvements)|$)/i);
    if (missingKeywordsMatch) {
      sections.missingKeywords = missingKeywordsMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-•*\d+\.]\s*/, '').trim())
        .filter(item => item.length > 0 && item.length < 100);
    }

    const improvementsMatch = text.match(/(?:##\s*)?(?:Top\s+)?\d+\s*Improvements?\s*\n([\s\S]*?)(?=\n(?:##|\*\*|Keywords|Recommendations)|$)/i);
    if (improvementsMatch) {
      sections.improvements = improvementsMatch[1]
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./) || line.trim().match(/^[-•*]\s+/))
        .map(line => line.replace(/^[\d+\.\s-•*]+/, '').trim())
        .filter(item => item.length > 0 && item.length < 200);
    }

    return sections;
  };

  const matchScore = extractMatchScore(analysis);
  const parsedSections = parseAnalysis(analysis);

  const getScoreColor = (score) => {
    if (!score) return '#94a3b8';
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  const getScoreVariant = (score) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreLabel = (score) => {
    if (!score) return 'Analysis Complete';
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Moderate Match';
    return 'Needs Improvement';
  };

  const getScoreMessage = (score) => {
    if (!score) return 'Review the detailed analysis below for full context.';
    if (score >= 80) return 'Your profile aligns closely with the requirements of this role.';
    if (score >= 60) return 'A solid foundation. Addressing the gaps below will strengthen your application.';
    return 'Several key gaps were identified. Review the recommendations to improve alignment.';
  };

  const getRemainingAnalysis = () => {
    let remaining = analysis;
    const sectionsToRemove = [
      /(?:##\s*)?Match\s*Score[^\n]*\n\s*\d+[^\n]*\n?/gi,
      /(?:##\s*)?Strengths?\s*\n[^#]*(?=\n##|\n\*\*|$)/gi,
      /(?:##\s*)?Missing\s*Skills?\s*\n[^#]*(?=\n##|\n\*\*|$)/gi,
      /(?:##\s*)?Missing\s*Keywords?\s*\n[^#]*(?=\n##|\n\*\*|$)/gi,
      /(?:##\s*)?(?:Top\s+)?\d+\s*Improvements?\s*\n[^#]*(?=\n##|\n\*\*|$)/gi,
    ];

    sectionsToRemove.forEach(regex => {
      remaining = remaining.replace(regex, '');
    });

    remaining = remaining.replace(/^\s*\n/, '');

    return remaining.trim() || 'No additional details available.';
  };

  return (
    <>
      {/* Score Overview Card */}
      <Card className="border-0 shadow-sm mb-4 score-card">
        <Card.Body className="p-4 p-md-5 text-center">
          <p className="text-uppercase text-secondary mb-4 fw-semibold letter-spacing">
            Overall Match Score
          </p>

          <div className="position-relative d-inline-block mb-4">
            <svg width="160" height="160" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none" stroke="#eef1f4" strokeWidth="6"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={getScoreColor(matchScore)}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 54 * ((matchScore || 0) / 100)} ${2 * Math.PI * 54 * (1 - ((matchScore || 0) / 100))}`}
                strokeDashoffset={2 * Math.PI * 54 * 0.25}
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
              <text x="60" y="56" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="600" fill="#1e293b" fontFamily="inherit">
                {matchScore ? `${matchScore}%` : '—'}
              </text>
              <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#94a3b8" letterSpacing="1.5">
                MATCH
              </text>
            </svg>
          </div>

          <div>
            <Badge
              bg={matchScore ? getScoreVariant(matchScore) : 'secondary'}
              className="px-3 py-2 fw-medium mb-3 score-badge"
            >
              {getScoreLabel(matchScore)}
            </Badge>
          </div>

          <p className="text-secondary small mb-0 mx-auto" style={{ maxWidth: '360px' }}>
            {getScoreMessage(matchScore)}
          </p>

          {matchScore && (
            <ProgressBar
              now={matchScore}
              variant={getScoreVariant(matchScore)}
              className="mt-4 mx-auto score-progress"
              style={{ maxWidth: '320px' }}
            />
          )}
        </Card.Body>
      </Card>

      {/* Summary Stats */}
      <Row className="mb-4 g-3">
        {parsedSections.strengths.length > 0 && (
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm text-center p-3 stat-card h-100">
              <div className="stat-value text-success">{parsedSections.strengths.length}</div>
              <div className="stat-label">Strengths Identified</div>
            </Card>
          </Col>
        )}
        {parsedSections.missingSkills.length > 0 && (
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm text-center p-3 stat-card h-100">
              <div className="stat-value text-danger">{parsedSections.missingSkills.length}</div>
              <div className="stat-label">Missing Skills</div>
            </Card>
          </Col>
        )}
        {parsedSections.missingKeywords.length > 0 && (
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm text-center p-3 stat-card h-100">
              <div className="stat-value text-warning">{parsedSections.missingKeywords.length}</div>
              <div className="stat-label">Missing Keywords</div>
            </Card>
          </Col>
        )}
        {parsedSections.improvements.length > 0 && (
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm text-center p-3 stat-card h-100">
              <div className="stat-value text-primary">{parsedSections.improvements.length}</div>
              <div className="stat-label">Recommended Actions</div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Detail Sections */}
      <Row className="g-3 mb-3">
        {parsedSections.strengths.length > 0 && (
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h6 className="section-title text-success mb-3">Strengths</h6>
                <ul className="list-unstyled mb-0">
                  {parsedSections.strengths.map((item, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-start">
                      <span className="bullet-dot bg-success me-2 mt-1"></span>
                      <span className="small text-body">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        )}

        {parsedSections.missingSkills.length > 0 && (
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h6 className="section-title text-danger mb-3">Missing Skills</h6>
                <ul className="list-unstyled mb-0">
                  {parsedSections.missingSkills.map((item, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-start">
                      <span className="bullet-dot bg-danger me-2 mt-1"></span>
                      <span className="small text-body">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Row className="g-3 mb-4">
        {parsedSections.missingKeywords.length > 0 && (
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h6 className="section-title text-warning mb-3">Missing Keywords</h6>
                <div className="d-flex flex-wrap gap-2">
                  {parsedSections.missingKeywords.map((item, idx) => (
                    <span key={idx} className="keyword-chip">{item}</span>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {parsedSections.improvements.length > 0 && (
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h6 className="section-title text-primary mb-3">Recommended Improvements</h6>
                <ol className="mb-0 ps-3">
                  {parsedSections.improvements.map((item, idx) => (
                    <li key={idx} className="mb-2 small text-body">{item}</li>
                  ))}
                </ol>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Full Report */}
      <Card className="border-0 shadow-sm">
        <Card.Footer className="bg-white border-top px-4 py-3">
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button variant="primary" onClick={onReset} className="px-4">
              Start New Analysis
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </>
  );
};

export default Results;