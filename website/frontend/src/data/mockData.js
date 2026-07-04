// Placeholder catalog data. Swap this out for real API responses later —
// the components below only expect this shape, so nothing else needs to change.

const gradients = [
  'linear-gradient(160deg, #6d5bd0, #2e1f63)',
  'linear-gradient(160deg, #d0466d, #631f3a)',
  'linear-gradient(160deg, #46a0d0, #1f4763)',
  'linear-gradient(160deg, #d0a446, #63481f)',
  'linear-gradient(160deg, #46d08b, #1f6345)',
  'linear-gradient(160deg, #a446d0, #4b1f63)',
  'linear-gradient(160deg, #d04646, #631f1f)',
  'linear-gradient(160deg, #46d0c4, #1f6360)',
]

function build(names, extra = () => ({})) {
  return names.map((title, i) => ({
    id: `${title}-${i}`,
    title,
    gradient: gradients[i % gradients.length],
    ...extra(i),
  }))
}

export const movies = build(
  ['Silver Horizon', 'Midnight Runner', 'Glass Orbit', 'Echo Valley', 'Paper Tigers', 'Last Frequency', 'Amber Road', 'Static Bloom'],
  (i) => ({
    genre: ['Action • Sci-Fi', 'Drama • Thriller', 'Comedy • Romance', 'Horror • Mystery'][i % 4],
    date: `0${(i % 9) + 1}/12/2026`,
    duration: `${1 + (i % 2)}h ${20 + i * 3}m`,
    description:
      'A short synopsis will go here once real catalog data is connected. For now this is placeholder copy so the layout can be reviewed end to end.',
  })
)

export const shows = build([
  'The Long Dark', 'Cedar Heights', 'Vantage Point', 'Nightfall Ave', 'Blue Static', 'Hollow Court', 'Redline', 'The Understudy',
])

export const music = build([
  'Low Tide', 'Neon Fields', 'Paper Moon', 'Concrete Bloom', 'Slow Static', 'Amber Skies', 'Glasshouse', 'Wire & Wax',
])

export const games = build([
  'Ashen Reach', 'Nightshift', 'Ironvale', 'Drift Protocol', 'Hollow Sky', 'Faultline', 'Rust & Ruin', 'Copper Sun',
])

export const heroSlides = movies.slice(0, 5)