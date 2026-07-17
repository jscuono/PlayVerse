import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Plus,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { fetchMovies, fetchShows, fetchMusic, fetchGames, fetchHero } from "../utils/api.js";
import "./Home.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MediaRow({ title, items, onSelect }) {
  const scrollerRef = useRef(null);

  function scroll(dir) {
    scrollerRef.current?.scrollBy({ left: dir * 500, behavior: "smooth" });
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="media-row">
      <h2>{title}</h2>
      <div className="row-wrap">
        <div className="row-scroller" ref={scrollerRef}>
          {items.map((item) => (
            <div
              className="poster-card"
              key={item.id}
              onClick={() => onSelect(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
            >
              <div className="poster">
                <img src={item.posterImage} alt={`${item.title} poster`} />
              </div>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="row-next left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="row-next right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [music, setMusic] = useState([]);
  const [games, setGames] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [addingMediaId, setAddingMediaId] = useState(null);
  const [addedMediaIds, setAddedMediaIds] = useState(() => new Set());
  const [playlistMessage, setPlaylistMessage] = useState("");
  const [playlistError, setPlaylistError] = useState("");
  const [playlistsLoading, setPlaylistsLoading] = useState(true);

  const navigate = useNavigate();

  const hero = heroSlides[heroIndex];
  const heroIsInPlaylist = hero ? addedMediaIds.has(String(hero.id)) : false;

  useEffect(() => {
    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        setCatalogError("");

        const [moviesResult, showsResult, musicResult, gamesResult, heroResult] =
          await Promise.all([
            fetchMovies(),
            fetchShows(),
            fetchMusic(),
            fetchGames(),
            fetchHero(),
          ]);

        setMovies(moviesResult.items);
        setShows(showsResult.items);
        setMusic(musicResult.items);
        setGames(gamesResult.items);
        setHeroSlides(heroResult.items);
      } catch (error) {
        setCatalogError(error.message);
      } finally {
        setCatalogLoading(false);
      }
    }

    loadCatalog();
  }, []);

  useEffect(() => {
    async function loadPlaylists() {
      try {
        setPlaylistsLoading(true);
        setPlaylistError("");

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

        const playlistIds = [
          ...(data.playlists?.movies || []),
          ...(data.playlists?.tvSeries || []),
          ...(data.playlists?.music || []),
          ...(data.playlists?.games || []),
        ].map(String);

        setAddedMediaIds(new Set(playlistIds));
      } catch (error) {
        setPlaylistError(error.message);
      } finally {
        setPlaylistsLoading(false);
      }
    }

    loadPlaylists();
  }, [navigate]);

  function changeHero(dir) {
    setHeroIndex((i) => (i + dir + heroSlides.length) % heroSlides.length);
  }

  function openMedia(item) {
    navigate(`/media/${encodeURIComponent(item.id)}`);
  }

  function handlePlaylistClick(item) {
    if (addedMediaIds.has(String(item.id))) {
      removeFromPlaylist(item);
    } else {
      addToPlaylist(item);
    }
  }

  async function removeFromPlaylist(item) {
    try {
      setAddingMediaId(item.id);
      setPlaylistMessage("");
      setPlaylistError("");

      const response = await fetch(`${API_URL}/api/auth/playlists/items`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mediaId: item.id,
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

      setAddedMediaIds((previousIds) => {
        const nextIds = new Set(previousIds);
        nextIds.delete(String(item.id));
        return nextIds;
      });

      setPlaylistMessage(data.message);
    } catch (error) {
      setPlaylistError(error.message);
    } finally {
      setAddingMediaId(null);
    }
  }

  async function addToPlaylist(item) {
    try {
      setAddingMediaId(item.id);
      setPlaylistMessage("");
      setPlaylistError("");

      const response = await fetch(`${API_URL}/api/auth/playlists/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mediaId: item.id,
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
          data.message || "Unable to add this item to your playlist.",
        );
      }

      setAddedMediaIds((previousIds) => {
        const nextIds = new Set(previousIds);
        nextIds.add(String(item.id));
        return nextIds;
      });

      setPlaylistMessage(data.message);
    } catch (error) {
      setPlaylistError(error.message);
    } finally {
      setAddingMediaId(null);
    }
  }

  if (catalogLoading) {
    return (
      <div className="home-page">
        <Navbar activeNav="home" />
        <main>
          <p>Loading PlayVerse...</p>
        </main>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="home-page">
        <Navbar activeNav="home" />
        <main>
          <p>Couldn&apos;t load the catalog: {catalogError}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar activeNav="home" />

      <main>
        {hero && (
          <>
            <section className="hero">
              <div className="hero-info">
                <span className="hero-tag">{hero.tag}</span>
                <h1>{hero.title}</h1>
                <p className="hero-genre">{hero.genre || hero.genres?.join(" • ")}</p>
                <div className="hero-meta">
                  <span>
                    <Calendar size={14} /> {hero.date}
                  </span>
                  <span>
                    <Clock size={14} /> {hero.duration}
                  </span>
                </div>
                <p className="hero-desc">{hero.description}</p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-view"
                    onClick={() => openMedia(hero)}
                  >
                    View <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="hero-playlist"
                    onClick={() => handlePlaylistClick(hero)}
                    disabled={playlistsLoading || addingMediaId === hero.id}
                  >
                    {playlistsLoading ? (
                      "Loading..."
                    ) : addingMediaId === hero.id ? (
                      heroIsInPlaylist ? (
                        "Removing..."
                      ) : (
                        "Adding..."
                      )
                    ) : heroIsInPlaylist ? (
                      <>
                        <Check size={16} />
                        Remove
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Playlist
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className="hero-image"
                style={{
                  backgroundImage: `url("${hero.backdropImage}")`,
                }}
              >
                <button
                  type="button"
                  className="hero-arrow left"
                  onClick={() => changeHero(-1)}
                  aria-label="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="hero-arrow right"
                  onClick={() => changeHero(1)}
                  aria-label="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </section>

            <div className="hero-dots">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  className={i === heroIndex ? "dot active" : "dot"}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {playlistError && <p className="account-error">{playlistError}</p>}

        <MediaRow title="Popular Movies" items={movies} onSelect={openMedia} />
        <MediaRow title="Popular Shows" items={shows} onSelect={openMedia} />
        <MediaRow title="Popular Music" items={music} onSelect={openMedia} />
        <MediaRow title="Popular Games" items={games} onSelect={openMedia} />
      </main>
    </div>
  );
}

export default Home;