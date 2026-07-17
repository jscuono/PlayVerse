const express = require("express");

const tmdb = require("./services/tmdb");
const rawg = require("./services/rawg");
const deezer = require("./services/deezer");

const router = express.Router();

function parsePage(value) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

// GET /api/media/movies?page=1&genre=28
router.get("/movies", async (req, res, next) => {
  try {
    const page = parsePage(req.query.page);

    const result = req.query.genre
      ? await tmdb.getMoviesByGenre(req.query.genre, page)
      : await tmdb.getPopularMovies(page);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/media/shows?page=1&genre=18
router.get("/shows", async (req, res, next) => {
  try {
    const page = parsePage(req.query.page);

    const result = req.query.genre
      ? await tmdb.getShowsByGenre(req.query.genre, page)
      : await tmdb.getPopularShows(page);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/media/games?page=1&genre=action
router.get("/games", async (req, res, next) => {
  try {
    const page = parsePage(req.query.page);

    const result = req.query.genre
      ? await rawg.getGamesByGenre(req.query.genre, page)
      : await rawg.getPopularGames(page);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/media/music?genre=132
router.get("/music", async (req, res, next) => {
  try {
    const result = req.query.genre
      ? await deezer.getTracksByGenre(req.query.genre)
      : await deezer.getChartTracks(30);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/media/genres/:type   (type = movies | shows | games | music)
router.get("/genres/:type", async (req, res, next) => {
  try {
    const { type } = req.params;

    let genres;

    if (type === "movies") genres = await tmdb.getMovieGenres();
    else if (type === "shows") genres = await tmdb.getTvGenres();
    else if (type === "games") genres = await rawg.getGameGenres();
    else if (type === "music") genres = await deezer.getGenres();
    else return res.status(400).json({ message: "Invalid media type." });

    res.json({ genres });
  } catch (error) {
    next(error);
  }
});

// GET /api/media/search?type=movies&query=star&page=1
router.get("/search", async (req, res, next) => {
  try {
    const { type, query } = req.query;
    const page = parsePage(req.query.page);

    if (!query || !query.trim()) {
      return res.json({ items: [], page: 1, totalPages: 1 });
    }

    let result;

    switch (type) {
      case "movies":
        result = await tmdb.searchMovies(query, page);
        break;
      case "shows":
        result = await tmdb.searchShows(query, page);
        break;
      case "games":
        result = await rawg.searchGames(query, page);
        break;
      case "music":
        result = await deezer.searchTracks(query);
        break;
      default:
        return res.status(400).json({ message: "Invalid media type." });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/media/hero -> a handful of items for the homepage hero carousel
router.get("/hero", async (req, res, next) => {
  try {
    const [movies, shows, music, games] = await Promise.all([
      tmdb.getPopularMovies(1),
      tmdb.getPopularShows(1),
      deezer.getChartTracks(5),
      rawg.getPopularGames(1),
    ]);

    const items = [
      movies.items[0],
      movies.items[1],
      shows.items[0],
      music.items[0],
      games.items[0],
    ].filter(Boolean);

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// GET /api/media/item/:type/:id   (type = movie | show | game | music)
router.get("/item/:type/:id", async (req, res, next) => {
  try {
    const { type, id } = req.params;

    let item;

    switch (type) {
      case "movie":
        item = await tmdb.getMovieDetails(id);
        break;
      case "show":
        item = await tmdb.getShowDetails(id);
        break;
      case "game":
        item = await rawg.getGameDetails(id);
        break;
      case "music":
        item = await deezer.getTrackDetails(id);
        break;
      default:
        return res.status(404).json({ message: "Media type not found." });
    }

    res.json({ item });
  } catch (error) {
    next(error);
  }
});

module.exports = router;