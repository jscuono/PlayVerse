const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { getDB } = require('../db');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const chatSessions = {};

router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!chatSessions[userId]) {
      chatSessions[userId] = [];
    }

    chatSessions[userId].push({ role: 'user', content: message });

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a media recommendation assistant for PlayVerse, an app for discovering movies, TV shows, games, and music.Nothing else at all.
          Help users find media based on their descriptions, moods, or preferences.
          If the user clearly want a certain type of media, try to reccomend that media more.
          Try to recommend more than one, unless its a very specific request, up to 10 maximum.
          The more general the message the more recomemndations.
          Always end your response with a JSON array in this exact format (no extra text after it):
          [{ "title": "Title", "type": "movie/show/game/music", "year": "2021", "reason": "Why they'd like it" }]
          If you have nothing to recommend yet, return an empty array [].`
        },
        ...chatSessions[userId]
      ]
    });

    const text = response.choices[0].message.content;
    chatSessions[userId].push({ role: 'assistant', content: text });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const rawRecommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    const conversational = text.replace(/\[[\s\S]*\]/, '').trim();

    const enriched = await Promise.all(rawRecommendations.map(async (item) => {
      try {
        let searchRes, searchData, result;

        if (item.type === 'movie') {
          searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(item.title)}&api_key=${process.env.TMDB_API_KEY}`);
          searchData = await searchRes.json();
          result = searchData.results?.[0];
        } else if (item.type === 'show') {
          searchRes = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(item.title)}&api_key=${process.env.TMDB_API_KEY}`);
          searchData = await searchRes.json();
          result = searchData.results?.[0];
        } else if (item.type === 'game') {
          searchRes = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(item.title)}&key=${process.env.RAWG_API_KEY}`);
          searchData = await searchRes.json();
          result = searchData.results?.[0];
          if (result) {
            return {
              ...item,
              tmdbId: result.id,
              poster: result.background_image || null,
              overview: result.description_raw || null,
              rating: null,
              ratingCount: 0,
              releaseDate: result.released,
            };
          }
        } else if (item.type === 'music') {
            searchRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(item.title)}`);
            searchData = await searchRes.json();
            result = searchData.data?.[0];
            if (result) {
                return {
                ...item,
                tmdbId: result.id,
                poster: result.album?.cover_big || null,
                overview: `By ${result.artist?.name} — ${result.album?.title}`,
                rating: null,
                ratingCount: 0,
                releaseDate: null,
                preview: result.preview,
                };
            }
            return { ...item, poster: null };
        }

        if (result) {
          const db = getDB();
          const userRatings = await db.collection('UserMedia').find({ MediaId: result.id.toString() }).toArray();
          const avgRating = userRatings.length > 0
            ? userRatings.reduce((sum, r) => sum + r.UserRating, 0) / userRatings.length
            : null;

          return {
            ...item,
            tmdbId: result.id,
            poster: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null,
            overview: result.overview,
            rating: avgRating,
            ratingCount: userRatings.length,
            releaseDate: result.release_date || result.first_air_date,
          };
        }
      } catch (e) {
        console.error(`Lookup failed for ${item.title}:`, e.message);
      }
      return { ...item, poster: null };
    }));

    res.json({ message: conversational, recommendations: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;