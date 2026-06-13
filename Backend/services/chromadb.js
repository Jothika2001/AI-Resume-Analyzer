const { ChromaClient } = require("chromadb");
const { GeminiEmbeddings } = require("./embedder");
const { chunkText } = require("./pdfParser");

const chromaClient = new ChromaClient({
  path: "http://localhost:8000",
});

async function getCollection(sessionId) {
  try {
    const collectionName = `resume_${sessionId.replace(/-/g, "_")}`;

    try {
      return await chromaClient.getCollection({
        name: collectionName,
        embeddingFunction: undefined  // Fix: Disable default embedding
      });
    } catch {
      return await chromaClient.createCollection({
        name: collectionName,
        embeddingFunction: undefined,  // Fix: Disable default embedding
        metadata: {
          "hnsw:space": "cosine",
          created: new Date().toISOString(),
          sessionId,
        },
      });
    }
  } catch (error) {
    throw new Error(`Failed to access ChromaDB: ${error.message}`);
  }
}

async function embedAndStore(resumeText, sessionId) {
  try {
    const chunks = chunkText(resumeText, 500, 50);

    if (chunks.length === 0) {
      throw new Error("No text chunks created from resume");
    }

    const embeddings = [];

    for (const chunk of chunks) {
      const embedding = await GeminiEmbeddings.getEmbedding(
        chunk.text
      );

      embeddings.push(embedding);
    }

    const collection = await getCollection(sessionId);

    const ids = chunks.map((_, index) => `chunk_${index}`);

    const metadatas = chunks.map((chunk) => ({
      index: chunk.index,
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      length: chunk.text.length,
    }));

    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents: chunks.map((chunk) => chunk.text),
    });

    return chunks.length;
  } catch (error) {
    throw new Error(
      `Failed to store resume in vector database: ${error.message}`
    );
  }
}

async function queryResume(
  jobDescription,
  sessionId,
  topK = 5
) {
  try {
    const jobEmbedding =
      await GeminiEmbeddings.getEmbedding(jobDescription);

    const collection = await getCollection(sessionId);

    const results = await collection.query({
      queryEmbeddings: [jobEmbedding],
      nResults: topK,
      include: ["documents"],
    });

    return results.documents[0] || [];
  } catch (error) {
    throw new Error(
      `Failed to query resume: ${error.message}`
    );
  }
}

async function cleanupCollection(sessionId) {
  try {
    const collectionName = `resume_${sessionId.replace(
      /-/g,
      "_"
    )}`;

    await chromaClient.deleteCollection({
      name: collectionName,
    });
  } catch (error) {
    console.warn(`Cleanup warning: ${error.message}`);
  }
}

module.exports = {
  embedAndStore,
  queryResume,
  cleanupCollection,
};
