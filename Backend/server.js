const express = require("express");
const cors = require("cors");
require("dotenv").config(); 

const analyzeRoutes = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT; 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/analyze", analyzeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running", timestamp: new Date() });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    success: false,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔬 Analyze: POST http://localhost:${PORT}/api/analyze`);
});

module.exports = app;
