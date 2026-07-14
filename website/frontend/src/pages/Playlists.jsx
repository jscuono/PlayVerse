import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import Navbar from "../components/Navbar.jsx";
import { movies, shows, music, games, allMedia } from "../data/mockData.js";

import "./Playlists.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const categories = [
  {
    key: "all",
    label: "All",
    items: allMedia,
  },
  {
    key: "movies",
    label: "Movies",
    items: movies,
  },
  {
    key: "shows",
    label: "TV Series",
    items: shows,
  },
  {
    key: "music",
    label: "Music",
    items: music,
  },
  {
    key: "games",
    label: "Games",
    items: games,
  },
];

function Playlists() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");

  const [playlistIds, setPlaylistIds] = useState(() => new Set());

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlaylists() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/auth/playlists`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 401) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your playlists.");
        }

        const ids = [
          ...(data.playlists?.movies || []),
          ...(data.playlists?.tvSeries || []),
          ...(data.playlists?.music || []),
          ...(data.playlists?.games || []),
        ].map(String);

        setPlaylistIds(new Set(ids));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [navigate]);

  const category = categories.find(
    (currentCategory) => currentCategory.key === activeCategory,
  );

  const items = useMemo(() => {
    return category.items.filter((item) => playlistIds.has(String(item.id)));
  }, [category, playlistIds]);

  async function handleRemove(item) {
    try {
      setRemovingId(item.id);
      setError("");

      const response = await fetch(`${API_URL}/api/auth/playlists/items`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mediaId: String(item.id),
          mediaType: item.type,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to remove this item from your playlist.",
        );
      }

      setPlaylistIds((previousIds) => {
        const nextIds = new Set(previousIds);
        nextIds.delete(String(item.id));
        return nextIds;
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRemovingId(null);
    }
  }

  function openMedia(item) {
    navigate(`/media/${encodeURIComponent(item.id)}`);
  }

  return (
    <div className="home-page">
      <Navbar activeNav="home" />

      <main className="playlists-main">
        <h1>Playlists</h1>

        <p>Discover what to watch, what to hear, and what to play next.</p>

        <div className="playlists-tabs">
          {categories.map((currentCategory) => (
            <button
              key={currentCategory.key}
              type="button"
              className={
                activeCategory === currentCategory.key
                  ? "search-tab active"
                  : "search-tab"
              }
              onClick={() => setActiveCategory(currentCategory.key)}
            >
              {currentCategory.label}
            </button>
          ))}
        </div>

        {error && <p className="playlists-error">{error}</p>}

        {loading ? (
          <p className="playlists-empty">Loading your playlists...</p>
        ) : items.length === 0 ? (
          <p className="playlists-empty">
            Nothing here yet. Add movies, shows, music, or games from their
            detail page.
          </p>
        ) : (
          <div className="playlists-grid">
            {items.map((item) => (
              <div className="playlist-card" key={item.id}>
                <button
                  type="button"
                  className="playlist-remove"
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.id}
                  aria-label={`Remove ${item.title} from playlists`}
                >
                  <X size={14} />
                </button>

                <div
                  className="playlist-poster"
                  onClick={() => openMedia(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      openMedia(item);
                    }
                  }}
                >
                  <img src={item.posterImage} alt={`${item.title} poster`} />
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

export default Playlists;
