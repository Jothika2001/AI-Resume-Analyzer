const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeResumeMatch(resumeChunks, jobDescription) {
  try {
    let resumeText = resumeChunks.join("\n\n").slice(0, 3000);
    let jobDesc = jobDescription.slice(0, 1500);
    
    const prompt = buildPrompt(resumeText, jobDesc);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
      }
    });
    
    const result = await model.generateContent(prompt);
    return (await result.response).text();
    
  } catch (error) {
    return getFallbackAnalysis();
  }
}

function buildPrompt(resumeText, jobDescription) {
  return `Analyze this resume against the job description:

RESUME: ${resumeText}

JOB: ${jobDescription}

Return EXACTLY this format:
## Match Score (0-100%)
[number]

## Strengths
- point 1
- point 2
- point 3

## Missing Skills
- skill 1
- skill 2

## Missing Keywords
- keyword 1
- keyword 2
- keyword 3

## Top 3 Improvements
1. improvement 1
2. improvement 2
3. improvement 3`;
}

function getFallbackAnalysis() {
  return `## Match Score
Service temporarily unavailable

## ATS Suggestions
- Add measurable achievements
- Include keywords from job description
- Use standard section headings`;
}

module.exports = { analyzeResumeMatch };

