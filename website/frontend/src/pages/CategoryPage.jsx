import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { CATEGORY_FETCHERS, fetchGenres } from "../utils/api.js";
import "./CategoryPage.css";

function CategoryPage({ navKey, title }) {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState("All");
  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGenres() {
      try {
        const data = await fetchGenres(navKey);
        if (!cancelled) setGenres(data.genres);
      } catch {
        if (!cancelled) setGenres([]);
      }
    }

    loadGenres();
    setActiveGenre("All");

    return () => {
      cancelled = true;
    };
  }, [navKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError("");

        const fetcher = CATEGORY_FETCHERS[navKey];
        const genreParam = activeGenre === "All" ? undefined : activeGenre;
        const data = await fetcher({ genre: genreParam });

        if (!cancelled) setItems(data.items);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [navKey, activeGenre]);

  function openMedia(item) {
    navigate(`/media/${encodeURIComponent(item.id)}`);
  }

  return (
    <div className="home-page">
      <Navbar activeNav={navKey} />

      <main className="category-main">
        <h1>{title}</h1>
        <p>Browse by genre to find something new.</p>

        <div className="category-genres">
          <button
            type="button"
            className={activeGenre === "All" ? "genre-pill active" : "genre-pill"}
            onClick={() => setActiveGenre("All")}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              className={activeGenre === String(g.id) ? "genre-pill active" : "genre-pill"}
              onClick={() => setActiveGenre(String(g.id))}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="category-empty">Loading...</p>
        ) : error ? (
          <p className="category-empty">Couldn&apos;t load this category: {error}</p>
        ) : items.length === 0 ? (
          <p className="category-empty">Nothing in this genre yet.</p>
        ) : (
          <div className="category-grid">
            {items.map((item) => (
              <div
                className="category-card"
                key={item.id}
                onClick={() => openMedia(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openMedia(item)}
              >
                <div className="category-poster">
                  <img src={item.posterImage} alt={`${item.title} poster`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                </div>
                <p>{item.title}</p>
                <span className="category-card-genres">{item.genre}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CategoryPage;