const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiEmbeddings {
  static totalEmbeddingsGenerated = 0;
  
  static EMBEDDING_MODEL = "gemini-embedding-001"; 

  static async getEmbedding(text) {
    const startTime = Date.now();

    try {
      const truncatedText = text.length > 2000 ? text.slice(0, 2000) : text;

      const model = genAI.getGenerativeModel({
        model: this.EMBEDDING_MODEL,
      });

      const result = await model.embedContent(truncatedText);

      if (!result || !result.embedding) {
        throw new Error("No embedding returned from Gemini");
      }

      this.totalEmbeddingsGenerated++;
      const duration = Date.now() - startTime;

      return result.embedding.values;
      
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  static async checkModelStatus() {
    try {
      const model = genAI.getGenerativeModel({
        model: this.EMBEDDING_MODEL,
      });
      const result = await model.embedContent("test");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Verify on startup
GeminiEmbeddings.checkModelStatus().catch(console.error);

module.exports = { GeminiEmbeddings };