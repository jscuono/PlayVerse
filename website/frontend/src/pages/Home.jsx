import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home as HomeIcon, Film, Tv, Music2, Gamepad2, Search,
  ChevronDown, User, ListPlus, LogOut, Calendar, Clock,
  Plus, ChevronRight, ChevronLeft,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { movies, shows, music, games, heroSlides } from '../data/mockData.js'
import './Home.css'

const navItems = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'movies', label: 'Movies', icon: Film },
  { key: 'shows', label: 'TV Series', icon: Tv },
  { key: 'music', label: 'Music', icon: Music2 },
  { key: 'games', label: 'Games', icon: Gamepad2 },
]

function MediaRow({ title, items }) {
  const scrollerRef = useRef(null)

  function scroll(dir) {
    scrollerRef.current?.scrollBy({ left: dir * 500, behavior: 'smooth' })
  }

  return (
    <section className="media-row">
      <h2>{title}</h2>
      <div className="row-wrap">
        <div className="row-scroller" ref={scrollerRef}>
          {items.map((item) => (
            <div className="poster-card" key={item.id}>
              <div className="poster" style={{ background: item.gradient }}>
                <span>{item.title}</span>
              </div>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
        <button type="button" className="row-next" onClick={() => scroll(1)} aria-label="Scroll right">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  )
}

function Home() {
  const [activeNav, setActiveNav] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const navigate = useNavigate()

  const hero = heroSlides[heroIndex]

  function changeHero(dir) {
    setHeroIndex((i) => (i + dir + heroSlides.length) % heroSlides.length)
  }

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="brand">
          <Logo size={26} />
          <span>PlayVerse</span>
        </div>

        <ul className="nav-links">
          {navItems.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                type="button"
                className={activeNav === key ? 'nav-link active' : 'nav-link'}
                onClick={() => setActiveNav(key)}
              >
                <Icon size={16} />
                {label}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="nav-link">
              <Search size={16} />
              Search
            </button>
          </li>
        </ul>

        <div className="user-menu">
          <button type="button" className="user-btn" onClick={() => setMenuOpen((v) => !v)}>
            Jane Doe
            <ChevronDown size={16} />
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <button type="button"><User size={16} /> Account</button>
              <button type="button"><ListPlus size={16} /> Playlists</button>
              <button type="button" onClick={() => navigate('/')}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-info">
            <span className="hero-tag">Movie</span>
            <h1>{hero.title}</h1>
            <p className="hero-genre">{hero.genre}</p>
            <div className="hero-meta">
              <span><Calendar size={14} /> {hero.date}</span>
              <span><Clock size={14} /> {hero.duration}</span>
            </div>
            <p className="hero-desc">{hero.description}</p>
            <div className="hero-actions">
              <button type="button" className="hero-view">View <ChevronRight size={16} /></button>
              <button type="button" className="hero-playlist"><Plus size={16} /> Playlist</button>
            </div>
          </div>

          <div className="hero-image" style={{ background: hero.gradient }}>
            <button type="button" className="hero-arrow left" onClick={() => changeHero(-1)} aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="hero-arrow right" onClick={() => changeHero(1)} aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        <div className="hero-dots">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={i === heroIndex ? 'dot active' : 'dot'}
              onClick={() => setHeroIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <MediaRow title="Popular Movies" items={movies} />
        <MediaRow title="Popular Shows" items={shows} />
        <MediaRow title="Popular Music" items={music} />
        <MediaRow title="Popular Games" items={games} />
      </main>
    </div>
  )
}

export default Home