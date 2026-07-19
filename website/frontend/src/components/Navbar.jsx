import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Home as HomeIcon,
  Film,
  Tv,
  Music2,
  Gamepad2,
  Search,
  Sparkles,
  ChevronDown,
  User,
  ListPlus,
  LogOut,
} from "lucide-react";

import "./Navbar.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const navItems = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
    path: "/home",
  },
  {
    key: "movies",
    label: "Movies",
    icon: Film,
    path: "/movies",
  },
  {
    key: "shows",
    label: "TV Series",
    icon: Tv,
    path: "/shows",
  },
  {
    key: "music",
    label: "Music",
    icon: Music2,
    path: "/music",
  },
  {
    key: "games",
    label: "Games",
    icon: Gamepad2,
    path: "/games",
  },
  {
    key: "ai",
    label: "Ask AI",
    icon: Sparkles,
    path: "/ai",
  },
];

function Navbar({ activeNav }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const resolvedActive =
    activeNav ?? (location.pathname.replace("/", "") || "home");

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
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
          throw new Error(data.message || "Unable to load user.");
        }

        setUser(data.user);
      } catch (error) {
        console.error("Unable to load navbar user:", error.message);
      }
    }

    loadCurrentUser();
  }, [navigate]);

  async function handleLogout() {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log out.");
      }

      setUser(null);
      setMenuOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  }

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Loading...";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo.svg" alt="PlayVerse" />
      </div>

      <ul className="nav-links">
        {navItems.map(({ key, label, icon: Icon, path }) => (
          <li key={key}>
            <button
              type="button"
              className={
                resolvedActive === key ? "nav-link active" : "nav-link"
              }
              onClick={() => navigate(path)}
            >
              <Icon size={16} />
              {label}
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            className={
              resolvedActive === "search" ? "nav-link active" : "nav-link"
            }
            onClick={() => navigate("/search")}
          >
            <Search size={16} />
            Search
          </button>
        </li>
      </ul>

      <div className="user-menu">
        <button
          type="button"
          className="user-btn"
          onClick={() => setMenuOpen((currentValue) => !currentValue)}
          disabled={!user}
        >
          {displayName}
          <ChevronDown size={16} />
        </button>

        {menuOpen && (
          <div className="user-dropdown">
            <button type="button" onClick={() => navigate("/account")}>
              <User size={16} />
              Account
            </button>

            <button type="button" onClick={() => navigate("/playlists")}>
              <ListPlus size={16} />
              Playlists
            </button>

            <button type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;