const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const trailerCache = new Map();

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSearchResult(result, gameTitle) {
  const videoTitle = normalizeText(result.snippet?.title);
  const normalizedGameTitle = normalizeText(gameTitle);

  let score = 0;

  /*
   * Favor results containing words from the game title.
   */
  const gameWords = normalizedGameTitle
    .split(" ")
    .filter((word) => word.length > 2);

  for (const word of gameWords) {
    if (videoTitle.includes(word)) {
      score += 3;
    }
  }

  /*
   * Favor likely official trailers.
   */
  if (videoTitle.includes("official")) score += 6;
  if (videoTitle.includes("trailer")) score += 8;
  if (videoTitle.includes("launch trailer")) score += 4;
  if (videoTitle.includes("announcement trailer")) score += 3;
  if (videoTitle.includes("reveal trailer")) score += 3;

  /*
   * Avoid unrelated video types.
   */
  if (videoTitle.includes("review")) score -= 12;
  if (videoTitle.includes("walkthrough")) score -= 12;
  if (videoTitle.includes("reaction")) score -= 12;
  if (videoTitle.includes("let's play")) score -= 12;
  if (videoTitle.includes("lets play")) score -= 12;
  if (videoTitle.includes("full game")) score -= 10;

  return score;
}

async function findGameTrailer(gameTitle, releaseDate = "") {
  const year = String(releaseDate || "").slice(0, 4);

  const cacheKey = `${gameTitle}-${year}`.toLowerCase().trim();

  if (trailerCache.has(cacheKey)) {
    return trailerCache.get(cacheKey);
  }

  const url = new URL(YOUTUBE_SEARCH_URL);

  const query = [gameTitle, year, "official trailer"].filter(Boolean).join(" ");

  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("order", "relevance");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoSyndicated", "true");
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`YouTube request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const results = Array.isArray(data.items) ? data.items : [];

  const rankedResults = results
    .filter((result) => result.id?.videoId)
    .map((result) => ({
      result,
      score: scoreSearchResult(result, gameTitle),
    }))
    .sort((a, b) => b.score - a.score);

  const videoKey = rankedResults[0]?.result?.id?.videoId || "";

  trailerCache.set(cacheKey, videoKey);

  return videoKey;
}

function scoreMusicSearchResult(result, songTitle, artistName) {
  const videoTitle = normalizeText(result.snippet?.title);

  const normalizedSongTitle = normalizeText(songTitle);

  const normalizedArtist = normalizeText(artistName);

  let score = 0;

  const songWords = normalizedSongTitle
    .split(" ")
    .filter((word) => word.length > 2);

  const artistWords = normalizedArtist
    .split(" ")
    .filter((word) => word.length > 2);

  for (const word of songWords) {
    if (videoTitle.includes(word)) {
      score += 4;
    }
  }

  for (const word of artistWords) {
    if (videoTitle.includes(word)) {
      score += 5;
    }
  }

  if (videoTitle.includes("official audio")) {
    score += 18;
  }

  if (videoTitle.includes("official music video")) {
    score += 16;
  }

  if (videoTitle.includes("official video")) {
    score += 14;
  }

  if (videoTitle.includes("provided to youtube")) {
    score += 12;
  }

  if (videoTitle.includes("topic")) {
    score += 8;
  }

  if (videoTitle.includes("lyrics")) {
    score += 2;
  }

  if (videoTitle.includes("cover")) {
    score -= 18;
  }

  if (videoTitle.includes("karaoke")) {
    score -= 18;
  }

  if (videoTitle.includes("reaction")) {
    score -= 18;
  }

  if (videoTitle.includes("slowed")) {
    score -= 14;
  }

  if (videoTitle.includes("sped up")) {
    score -= 14;
  }

  if (videoTitle.includes("nightcore")) {
    score -= 14;
  }

  if (videoTitle.includes("8d audio")) {
    score -= 12;
  }

  return score;
}

async function findMusicVideo(songTitle, artistName) {
  const cacheKey = `music:${songTitle}:${artistName}`.toLowerCase().trim();

  if (trailerCache.has(cacheKey)) {
    return trailerCache.get(cacheKey);
  }

  const query = [songTitle, artistName, "official audio"]
    .filter(Boolean)
    .join(" ");

  const url = new URL(YOUTUBE_SEARCH_URL);

  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("order", "relevance");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoSyndicated", "true");
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("videoCategoryId", "10");

  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `YouTube music search failed (${response.status}): ${body}`,
    );
  }

  const data = await response.json();

  const results = Array.isArray(data.items) ? data.items : [];

  const rankedResults = results
    .filter((result) => result.id?.videoId)
    .map((result) => ({
      result,
      score: scoreMusicSearchResult(result, songTitle, artistName),
    }))
    .sort((first, second) => {
      return second.score - first.score;
    });

  const videoKey = rankedResults[0]?.result?.id?.videoId || "";

  trailerCache.set(cacheKey, videoKey);

  return videoKey;
}

module.exports = {
  findGameTrailer,
  findMusicVideo,
};
