require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB } = require("./db");
const authRoutes = require("./authRoutes");
const mediaRoutes = require("./mediaRoutes");

const app = express();

const requiredEnvironmentVariables = [
  "MONGODB_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
  "GOOGLE_CLIENT_ID",
  "TMDB_API_KEY",
  "RAWG_API_KEY",
  //"GEMINI_API_KEY"
  //"YOUTUBE_API_KEY",
];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing environment variable: ${variableName}`);
  }
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    message: "PlayVerse backend is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

const port = Number(process.env.PORT) || 5000;

//Groq Ai
const recommendationRoutes = require('./services/groqRecom');
app.use('/api/recommendations', recommendationRoutes);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Backend startup failed:", error);
    process.exit(1);
  });
