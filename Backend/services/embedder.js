const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Validate API key
if (!process.env.GEMINI_API_KEY) {
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiEmbeddings {
  static totalEmbeddingsGenerated = 0;

  static async getEmbedding(text) {
    const startTime = Date.now();

    try {
      // ✅ Fixed token limit (2000 chars is safe)
      const truncatedText = text.length > 2000 ? text.slice(0, 2000) : text;

      const model = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });

      const result = await model.embedContent(truncatedText);

      if (!result || !result.embedding || !result.embedding.values) {
        throw new Error("No embedding returned from Gemini");
      }

      this.totalEmbeddingsGenerated++;
      const duration = Date.now() - startTime;

      console.log(`✅ Embedding generated in ${duration}ms (Total: ${this.totalEmbeddingsGenerated})`);

      return result.embedding.values;
    } catch (error) {
      console.error("Embedding error:", error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  static async checkModelStatus() {
    try {
      const model = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
      await model.embedContent("test");
      console.log("✅ Gemini embedding model is ready");
      return true;
    } catch (error) {
      console.error("❌ Gemini embedding model unavailable:", error.message);
      return false;
    }
  }
}

// Verify on startup
GeminiEmbeddings.checkModelStatus().catch(console.error);

module.exports = { GeminiEmbeddings };