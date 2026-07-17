const PROVIDER_STYLES = {
  netflix: { label: "Netflix", bg: "#e50914", fg: "#ffffff" },
  prime: { label: "Prime Video", bg: "#00a8e1", fg: "#0b1a2b" },
  apple: { label: "Apple TV", bg: "#111111", fg: "#ffffff" },
  disney: { label: "Disney+", bg: "#113ccf", fg: "#ffffff" },
  hbo: { label: "Max", bg: "#5822b4", fg: "#ffffff" },
  hulu: { label: "Hulu", bg: "#1ce783", fg: "#0b1a2b" },
  spotify: { label: "Spotify", bg: "#1db954", fg: "#04120a" },
  deezer: { label: "Deezer", bg: "#a238ff", fg: "#ffffff" },
  steam: { label: "Steam", bg: "#1b2838", fg: "#ffffff" },
};

// Matches a loose provider name (as returned by TMDB, etc.) to one of our
// known badge keys. Returns null if we don't have a badge for it.
function matchProviderKey(name) {
  const normalized = String(name || "").toLowerCase();

  if (normalized.includes("netflix")) return "netflix";
  if (normalized.includes("prime")) return "prime";
  if (normalized.includes("apple")) return "apple";
  if (normalized.includes("disney")) return "disney";
  if (normalized.includes("max") || normalized.includes("hbo")) return "hbo";
  if (normalized.includes("hulu")) return "hulu";
  if (normalized.includes("steam")) return "steam";
  if (normalized.includes("spotify")) return "spotify";
  if (normalized.includes("deezer")) return "deezer";

  return null;
}

// Turns a list of raw provider names into deduplicated badge objects.
function mapProviders(names = []) {
  const seen = new Set();
  const result = [];

  for (const name of names) {
    const key = matchProviderKey(name);

    if (key && !seen.has(key)) {
      seen.add(key);
      result.push({ key, ...PROVIDER_STYLES[key] });
    }
  }

  return result;
}

function badge(key) {
  return { key, ...PROVIDER_STYLES[key] };
}

module.exports = {
  PROVIDER_STYLES,
  mapProviders,
  badge,
};