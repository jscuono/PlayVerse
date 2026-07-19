const express = require("express");
const jwt = require("jsonwebtoken");
const Groq = require("groq-sdk");

const { getDB } = require("../db");

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// userId -> { history: [{role, content}], messages: [{role, text, recommendations?}] }
const sessions = {};

const MAX_HISTORY_MESSAGES = 40; // stored
const MAX_CONTEXT_MESSAGES = 20; // sent to Groq per request

function requireAuth(req, res, next) {
  const token = req.cookies.pv_auth;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({
      message: "Your login session is invalid or expired.",
    });
  }
}

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = { history: [], messages: [] };
  }

  return sessions[userId];
}

const SYSTEM_PROMPT = `You are a media recommendation assistant for PlayVerse, an app for discovering movies, TV shows, games, and music. Nothing else at all.
Help users find media based on their descriptions, moods, or preferences.
If the user clearly wants a certain type of media, try to recommend that media more.
Try to recommend more than one, unless it's a very specific request, up to 10 maximum.
The more general the message the more recommendations.
Always end your response with a JSON array in this exact format (no extra text after it):
[{ "title": "Title", "type": "movie/show/game/music", "year": "2021", "reason": "Why they'd like it" }]
If you have nothing to recommend yet, return an empty array [].`;

// Looks up the average PlayVerse user rating for an already-resolved item.
// mediaId here matches the format ratings are stored under: "type-sourceId".
async function getRatingStats(mediaId, mediaType) {
  try {
    const db = getDB();

    const pipeline = [
      { $unwind: "$ratings" },
      {
        $match: {
          "ratings.mediaId": mediaId,
          "ratings.mediaType": mediaType,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$ratings.score" },
          count: { $sum: 1 },
        },
      },
    ];

    const [stats] = await db.collection("users").aggregate(pipeline).toArray();

    return {
      rating: stats ? Number(stats.avg.toFixed(1)) : null,
      ratingCount: stats ? stats.count : 0,
    };
  } catch (error) {
    console.error("Rating lookup failed:", error.message);
    return { rating: null, ratingCount: 0 };
  }
}

async function enrichRecommendation(item) {
  try {
    if (item.type === "movie") {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          item.title,
        )}&api_key=${process.env.TMDB_API_KEY}`,
      );
      const data = await response.json();
      const result = data.results?.[0];

      if (!result) return { ...item, poster: null };

      const mediaId = `movie-${result.id}`;
      const { rating, ratingCount } = await getRatingStats(mediaId, "movie");

      return {
        ...item,
        id: mediaId,
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
          : null,
        overview: result.overview,
        rating,
        ratingCount,
        releaseDate: result.release_date,
      };
    }

    if (item.type === "show") {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
          item.title,
        )}&api_key=${process.env.TMDB_API_KEY}`,
      );
      const data = await response.json();
      const result = data.results?.[0];

      if (!result) return { ...item, poster: null };

      const mediaId = `show-${result.id}`;
      const { rating, ratingCount } = await getRatingStats(mediaId, "show");

      return {
        ...item,
        id: mediaId,
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
          : null,
        overview: result.overview,
        rating,
        ratingCount,
        releaseDate: result.first_air_date,
      };
    }

    if (item.type === "game") {
      const response = await fetch(
        `https://api.rawg.io/api/games?search=${encodeURIComponent(
          item.title,
        )}&key=${process.env.RAWG_API_KEY}`,
      );
      const data = await response.json();
      const result = data.results?.[0];

      if (!result) return { ...item, poster: null };

      const mediaId = `game-${result.id}`;
      const { rating, ratingCount } = await getRatingStats(mediaId, "game");

      return {
        ...item,
        id: mediaId,
        poster: result.background_image || null,
        overview: result.description_raw || null,
        rating,
        ratingCount,
        releaseDate: result.released,
      };
    }

    if (item.type === "music") {
      const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(item.title)}`,
      );
      const data = await response.json();
      const result = data.data?.[0];

      if (!result) return { ...item, poster: null };

      const mediaId = `music-${result.id}`;
      const { rating, ratingCount } = await getRatingStats(mediaId, "music");

      return {
        ...item,
        id: mediaId,
        poster: result.album?.cover_big || null,
        overview: `By ${result.artist?.name} — ${result.album?.title}`,
        rating,
        ratingCount,
        releaseDate: null,
        preview: result.preview,
      };
    }
  } catch (error) {
    console.error(`Lookup failed for ${item.title}:`, error.message);
  }

  return { ...item, poster: null };
}

// GET /api/recommendations/chat — hydrate the current conversation on load.
router.get("/chat", requireAuth, (req, res) => {
  const session = getSession(req.userId);
  res.json({ messages: session.messages });
});

// DELETE /api/recommendations/chat — start a new conversation.
router.delete("/chat", requireAuth, (req, res) => {
  sessions[req.userId] = { history: [], messages: [] };
  res.json({ message: "Conversation cleared." });
});

// POST /api/recommendations/chat — send a message, get a reply + recs.
router.post("/chat", requireAuth, async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    const session = getSession(req.userId);

    session.history.push({ role: "user", content: message });
    session.messages.push({ role: "user", text: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...session.history.slice(-MAX_CONTEXT_MESSAGES),
      ],
    });

    const text = completion.choices[0].message.content;

    session.history.push({ role: "assistant", content: text });
    session.history = session.history.slice(-MAX_HISTORY_MESSAGES);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const rawRecommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    const conversational = text.replace(/\[[\s\S]*\]/, "").trim();

    const recommendations = await Promise.all(
      rawRecommendations.map(enrichRecommendation),
    );

    session.messages.push({
      role: "assistant",
      text: conversational,
      recommendations,
    });
    session.messages = session.messages.slice(-MAX_HISTORY_MESSAGES);

    res.json({ message: conversational, recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get recommendations." });
  }
});

module.exports = router;