import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { CATEGORY_FETCHERS, searchMedia } from "../utils/api.js";
import "./Search.css";

const categories = [
  { key: "movies", label: "Movies" },
  { key: "shows", label: "TV Series" },
  { key: "music", label: "Music" },
  { key: "games", label: "Games" },
];

const sortOptions = [
  { key: "popularity", label: "Popularity" },
  { key: "recent", label: "Recent" },
  { key: "trending", label: "Trending" },
];

function Search() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("movies");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [sortOpen, setSortOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sortLabel = sortOptions.find((s) => s.key === sortBy)?.label;

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const trimmedQuery = query.trim();

        const data = trimmedQuery
          ? await searchMedia({ type: activeCategory, query: trimmedQuery })
          : await CATEGORY_FETCHERS[activeCategory]();

        if (cancelled) return;

        let items = data.items;

        if (sortBy === "recent") {
          items = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
        } else if (sortBy === "trending") {
          items = [...items].reverse();
        }

        setResults(items);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timeoutId = setTimeout(loadResults, 300); // debounce typing

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [activeCategory, query, sortBy]);

  function openMedia(item) {
    navigate(`/media/${encodeURIComponent(item.id)}`);
  }

  return (
    <div className="home-page">
      <Navbar activeNav="search" />

      <main className="search-main">
        <div className="search-head">
          <div>
            <h1>Search</h1>
            <p>Discover what to watch, what to hear, and what to play next.</p>

            <div className="search-input">
              <input
                type="text"
                placeholder="Search title, artist, etc..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon size={16} />
            </div>

            <div className="search-tabs">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={activeCategory === c.key ? "search-tab active" : "search-tab"}
                  onClick={() => setActiveCategory(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-sort">
            <button type="button" className="sort-btn" onClick={() => setSortOpen((v) => !v)}>
              Sort By: {sortLabel} <ChevronDown size={16} />
            </button>
            {sortOpen && (
              <div className="sort-dropdown">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={sortBy === opt.key ? "sort-option active" : "sort-option"}
                    onClick={() => {
                      setSortBy(opt.key);
                      setSortOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="search-empty">Loading...</p>
        ) : error ? (
          <p className="search-empty">Couldn&apos;t search: {error}</p>
        ) : results.length === 0 ? (
          <p className="search-empty">No results for &quot;{query}&quot;.</p>
        ) : (
          <div className="search-grid">
            {results.map((item) => (
              <div
                className="search-card"
                key={item.id}
                onClick={() => openMedia(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openMedia(item)}
              >
                <div className="search-poster">
                  <img src={item.posterImage} alt={`${item.title} poster`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Search;