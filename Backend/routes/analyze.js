const express = require("express");
const router = express.Router();
const upload = require("../config/upload"); 

const pdfParser = require("../services/pdfParser");
const {
  embedAndStore,
  queryResume,
  cleanupCollection,
} = require("../services/chromadb");
const { analyzeResumeMatch } = require("../services/llm");

router.post("/", upload.single("resume"), async (req, res) => {
  const requestStartTime = Date.now();

  try {
    // Validation
    if (!req.file) {
      return res.status(400).json({
        error: "Resume file is required",
      });
    }

    if (!req.body.jobDescription) {
      return res.status(400).json({
        error: "Job description is required",
      });
    }

    // Extract text from PDF
    const resumeText = await pdfParser.extractText(req.file.buffer);

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        error: "Could not extract text from PDF. Please ensure it contains readable text.",
      });
    }

    // Create unique session
    const sessionId = `resume_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    // Generate embeddings and store in ChromaDB
    await embedAndStore(resumeText, sessionId);

    // Retrieve relevant chunks using RAG
    const relevantChunks = await queryResume(
      req.body.jobDescription,
      sessionId
    );

    // Analyze with Gemini
    const analysis = await analyzeResumeMatch(
      relevantChunks,
      req.body.jobDescription
    );

    // Cleanup ChromaDB collection after 1 hour
    setTimeout(() => {
      cleanupCollection(sessionId).catch(console.error);
    }, 60 * 60 * 1000);

    const totalDuration = Date.now() - requestStartTime;

    res.json({
      success: true,
      analysis,
      metadata: {
        resumeLength: resumeText.length,
        chunksAnalyzed: relevantChunks.length,
        sessionId,
        processingTimeMs: totalDuration,
      },
    });
    
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      error: `Failed to analyze resume: ${error.message}`,
    });
  }
});

module.exports = router;