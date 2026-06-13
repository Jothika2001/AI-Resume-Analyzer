const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeResumeMatch(resumeChunks, jobDescription) {
  try {
    let resumeText = resumeChunks.join("\n\n");

    if (resumeText.length > 3000) {
      resumeText = resumeText.slice(0, 3000);
    }

    let truncatedJobDesc = jobDescription;
    if (truncatedJobDesc.length > 1500) {
      truncatedJobDesc = truncatedJobDesc.slice(0, 1500);
    }

    const prompt = constructPrompt(resumeText, truncatedJobDesc);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        topP: 0.95,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini Analysis Error:", error.message);
    return getFallbackAnalysis();
  }
}

function constructPrompt(resumeText, jobDescription) {
  return `
You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze this resume against the job description and provide actionable feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return your analysis in EXACTLY this format:

## Match Score (0-100%)
[Number only]

## Strengths
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]

## Missing Skills
- [Missing skill 1]
- [Missing skill 2]
- [Missing skill 3]

## Missing Keywords
- [Keyword 1]
- [Keyword 2]
- [Keyword 3]
- [Keyword 4]
- [Keyword 5]

## ATS Optimization Suggestions
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]

## Top 3 Quick Improvements
1. [Improvement 1]
2. [Improvement 2]
3. [Improvement 3]

Be specific, concise, and actionable. Focus on ATS compatibility.`;
}

function getFallbackAnalysis() {
  return `## Match Score (0-100%)
N/A

## Strengths
- Resume successfully uploaded and parsed

## Missing Skills
- Unable to analyze (AI service temporarily unavailable)

## Missing Keywords
- Review job description for key terms

## ATS Optimization Suggestions
- Add measurable achievements with numbers
- Include exact keywords from job description
- Use standard section headings (Experience, Education, Skills)
- Save as PDF (already done ✓)
- Avoid tables and images

## Top 3 Quick Improvements
1. Tailor resume to each job application
2. Include more quantifiable results (e.g., "increased X by Y%")
3. Match keywords from the job description exactly

⚠️ Note: This is a fallback analysis. Please check your Gemini API configuration.`;
}

module.exports = {
  analyzeResumeMatch,
};