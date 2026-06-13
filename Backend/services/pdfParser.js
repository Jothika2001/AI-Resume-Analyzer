// Option 1: Use require with proper handling
const pdfParse = require('pdf-parse');

async function extractText(pdfBuffer) {
  try {
    // pdf-parse expects a buffer and returns a promise
    const data = await pdfParse(pdfBuffer);
    
    const text = data.text.replace(/\s+/g, " ").trim();
    
    if (!text || text.length < 50) {
      throw new Error("No readable text content found in PDF");
    }
    
    return text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  
  if (!text || text.length === 0) {
    return chunks;
  }
  
  if (overlap >= chunkSize) {
    overlap = Math.floor(chunkSize / 2);
  }
  
  const step = chunkSize - overlap;
  
  for (let start = 0; start < text.length; start += step) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    
    if (chunk.length < 30) {
      continue;
    }
    
    chunks.push({
      text: chunk,
      index: chunks.length,
      startIndex: start,
      endIndex: end,
    });
  }
  
  return chunks;
}

module.exports = {
  extractText,
  chunkText,
};