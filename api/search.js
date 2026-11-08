/**
 * Cliffhanger 🇨🇦 - Serverless Search Proxy
 * Compatible with Vercel Serverless Functions and Netlify Functions.
 *
 * Security & Performance Benefits:
 * - TMDB API key is kept 100% secret on the server (never exposed to client).
 * - Caches responses in-memory and via HTTP Cache-Control headers to conserve TMDB quota.
 * - Simple IP rate limiter prevents bot scraping.
 * - Smart Canadian Streaming relevance ranking performed server-side.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

// ---------------------------------------------------------------------------
// In-Memory Cache (Query Cache & Provider Cache)
// ---------------------------------------------------------------------------
const searchCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

// In-memory rate limiting by IP (max 40 requests per 60 seconds)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;

// ---------------------------------------------------------------------------
// Canadian Demo Dataset Fallback (Used when no TMDB_API_KEY is configured)
// ---------------------------------------------------------------------------
const DEMO_DATABASE = [
  {
    id: 100088,
    title: 'The Last of Us',
    media_type: 'tv',
    year: '2023',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.',
    poster_path: 'https://image.tmdb.org/t/p/w500/uKvVjK1qYXxAZ2Riioq69Z04Vjh.jpg',
    vote_average: 8.6,
    ca_providers: {
      flatrate: [
        { provider_name: 'Crave', logo_path: 'https://images.justwatch.com/icon/430997/s100/crave.webp' }
      ],
      rent: [
        { provider_name: 'Apple TV', logo_path: 'https://images.justwatch.com/icon/190848813/s100/apple-tv.webp' },
        { provider_name: 'Google Play', logo_path: 'https://images.justwatch.com/icon/169478387/s100/google-play-movies.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/the-last-of-us'
    }
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    media_type: 'movie',
    year: '2024',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGhkAiIHQw9e.jpg',
    vote_average: 8.2,
    ca_providers: {
      flatrate: [
        { provider_name: 'Crave', logo_path: 'https://images.justwatch.com/icon/430997/s100/crave.webp' }
      ],
      rent: [
        { provider_name: 'Apple TV', logo_path: 'https://images.justwatch.com/icon/190848813/s100/apple-tv.webp' },
        { provider_name: 'Amazon Prime Video', logo_path: 'https://images.justwatch.com/icon/52449861/s100/amazon-prime-video.webp' },
        { provider_name: 'Cineplex', logo_path: 'https://images.justwatch.com/icon/128599729/s100/cineplex.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/movie/dune-part-two'
    }
  },
  {
    id: 76331,
    title: 'Succession',
    media_type: 'tv',
    year: '2018',
    overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down.',
    poster_path: 'https://image.tmdb.org/t/p/w500/7udWqx204VvyNq9b9g14jZgUeL4.jpg',
    vote_average: 8.9,
    ca_providers: {
      flatrate: [
        { provider_name: 'Crave', logo_path: 'https://images.justwatch.com/icon/430997/s100/crave.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/succession'
    }
  },
  {
    id: 61662,
    title: "Schitt's Creek",
    media_type: 'tv',
    year: '2015',
    overview: 'Formerly filthy rich Johnny Rose, his soap star wife Moira, and their two kids suddenly find themselves broke and forced to live in Schitt\'s Creek.',
    poster_path: 'https://image.tmdb.org/t/p/w500/iZEOzYV9o7tZ6bV2p3i0KkO7f3.jpg',
    vote_average: 8.2,
    ca_providers: {
      flatrate: [
        { provider_name: 'CBC Gem', logo_path: 'https://images.justwatch.com/icon/114979339/s100/cbc-gem.webp' },
        { provider_name: 'Netflix', logo_path: 'https://images.justwatch.com/icon/207360008/s100/netflix.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/schitts-creek'
    }
  },
  {
    id: 106379,
    title: 'Fallout',
    media_type: 'tv',
    year: '2024',
    overview: '200 years after the apocalypse, the gentle denizens of luxury fallout shelters are forced to return to the irradiated hellscape.',
    poster_path: 'https://image.tmdb.org/t/p/w500/AnsZuL5i088vH2Vq5q84YjC9B4d.jpg',
    vote_average: 8.4,
    ca_providers: {
      flatrate: [
        { provider_name: 'Amazon Prime Video', logo_path: 'https://images.justwatch.com/icon/52449861/s100/amazon-prime-video.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/fallout'
    }
  },
  {
    id: 66732,
    title: 'Stranger Things',
    media_type: 'tv',
    year: '2016',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    vote_average: 8.6,
    ca_providers: {
      flatrate: [
        { provider_name: 'Netflix', logo_path: 'https://images.justwatch.com/icon/207360008/s100/netflix.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/stranger-things'
    }
  },
  {
    id: 545611,
    title: 'Everything Everywhere All at Once',
    media_type: 'movie',
    year: '2022',
    overview: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what is important to her by connecting with alternate lives.',
    poster_path: 'https://image.tmdb.org/t/p/w500/w3LxiVYPqRLexPkaekcr9vgGZr1.jpg',
    vote_average: 7.8,
    ca_providers: {
      flatrate: [
        { provider_name: 'Amazon Prime Video', logo_path: 'https://images.justwatch.com/icon/52449861/s100/amazon-prime-video.webp' },
        { provider_name: 'Netflix', logo_path: 'https://images.justwatch.com/icon/207360008/s100/netflix.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/movie/everything-everywhere-all-at-once'
    }
  },
  {
    id: 95557,
    title: 'Severance',
    media_type: 'tv',
    year: '2022',
    overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
    poster_path: 'https://image.tmdb.org/t/p/w500/fV5H0t43e4C3G4wS0aN7oHnKq0y.jpg',
    vote_average: 8.4,
    ca_providers: {
      flatrate: [
        { provider_name: 'Apple TV Plus', logo_path: 'https://images.justwatch.com/icon/190848813/s100/apple-tv.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/severance'
    }
  },
  {
    id: 114479,
    title: 'The Bear',
    media_type: 'tv',
    year: '2022',
    overview: 'A young chef from the fine dining world comes home to Chicago to run his family Italian beef sandwich shop.',
    poster_path: 'https://image.tmdb.org/t/p/w500/sHq39U4h6B56d4Bq8y2N5g8eL8a.jpg',
    vote_average: 8.3,
    ca_providers: {
      flatrate: [
        { provider_name: 'Disney Plus', logo_path: 'https://images.justwatch.com/icon/147630384/s100/disney-plus.webp' }
      ],
      justwatch_url: 'https://www.justwatch.com/ca/tv-show/the-bear'
    }
  }
];

// ---------------------------------------------------------------------------
// Ranking Algorithm
// ---------------------------------------------------------------------------
function calculateRelevanceScore(item, query) {
  const q = (query || '').trim().toLowerCase();
  const t = (item.title || '').trim().toLowerCase();
  let score = 0;

  if (t === q) {
    score += 1000;
  } else if (t.startsWith(q)) {
    score += 500;
  } else if (t.includes(` ${q} `) || t.startsWith(`${q}:`) || t.startsWith(`${q} `) || t.endsWith(` ${q}`)) {
    score += 250;
  } else if (t.includes(q)) {
    score += 100;
  }

  // Boost titles actively streaming in Canada on subscription
  if (item.ca_providers?.flatrate && item.ca_providers.flatrate.length > 0) {
    score += 200;
  } else if (item.ca_providers?.rent?.length || item.ca_providers?.buy?.length) {
    score += 50;
  }

  if (item.vote_average) {
    score += Math.min(50, parseFloat(item.vote_average) * 5);
  }

  return score;
}

function sortResults(items, query) {
  return [...items].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query);
    const scoreB = calculateRelevanceScore(b, query);
    return scoreB - scoreA;
  });
}

// ---------------------------------------------------------------------------
// Rate Limiter Helper
// ---------------------------------------------------------------------------
function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

// ---------------------------------------------------------------------------
// Search Handler
// ---------------------------------------------------------------------------
async function handleSearch(query, mediaFilter = 'all') {
  const apiKey = process.env.TMDB_API_KEY;

  // Fallback to demo mode if no server API key configured yet
  if (!apiKey || apiKey.trim() === '') {
    const qLower = query.toLowerCase().trim();
    const filtered = DEMO_DATABASE.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(qLower) || qLower.includes(item.title.toLowerCase());
      const matchesType = mediaFilter === 'all' || item.media_type === mediaFilter;
      return matchesQuery && matchesType;
    });

    return {
      results: sortResults(filtered, query),
      isDemo: true,
      source: 'demo_database'
    };
  }

  // Live TMDB API Query
  let searchEndpoint = '';
  if (mediaFilter === 'movie') {
    searchEndpoint = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  } else if (mediaFilter === 'tv') {
    searchEndpoint = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  } else {
    searchEndpoint = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  }

  const response = await fetch(searchEndpoint);
  if (!response.ok) {
    throw new Error(`TMDB error (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  const rawItems = (data.results || []).filter(item => {
    const type = item.media_type || (mediaFilter !== 'all' ? mediaFilter : (item.title ? 'movie' : 'tv'));
    return type === 'movie' || type === 'tv';
  }).slice(0, 10);

  // Fetch Canadian watch providers in parallel
  const enrichedItems = await Promise.all(
    rawItems.map(async (item) => {
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      const title = item.title || item.name;
      const releaseDate = item.release_date || item.first_air_date || '';
      const year = releaseDate ? releaseDate.substring(0, 4) : '';
      const poster = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null;

      let caProviders = null;
      try {
        const provRes = await fetch(`https://api.themoviedb.org/3/${type}/${item.id}/watch/providers?api_key=${apiKey}`);
        if (provRes.ok) {
          const provData = await provRes.json();
          const caData = provData.results && provData.results.CA;
          if (caData) {
            caProviders = {
              flatrate: (caData.flatrate || []).map(p => ({
                provider_name: p.provider_name,
                logo_path: p.logo_path ? `${TMDB_LOGO_BASE}${p.logo_path}` : null
              })),
              rent: (caData.rent || []).map(p => ({
                provider_name: p.provider_name,
                logo_path: p.logo_path ? `${TMDB_LOGO_BASE}${p.logo_path}` : null
              })),
              buy: (caData.buy || []).map(p => ({
                provider_name: p.provider_name,
                logo_path: p.logo_path ? `${TMDB_LOGO_BASE}${p.logo_path}` : null
              })),
              justwatch_url: caData.link || `https://www.justwatch.com/ca/search?q=${encodeURIComponent(title)}`
            };
          }
        }
      } catch (err) {
        console.warn(`Could not load providers for ${title}:`, err);
      }

      return {
        id: item.id,
        title,
        media_type: type,
        year,
        overview: item.overview || 'No synopsis provided.',
        poster_path: poster,
        vote_average: item.vote_average ? item.vote_average.toFixed(1) : null,
        ca_providers: caProviders
      };
    })
  );

  return {
    results: sortResults(enrichedItems, query),
    isDemo: false,
    source: 'tmdb_live'
  };
}

// ---------------------------------------------------------------------------
// Standard Serverless Handler (Vercel & Netlify compatible)
// ---------------------------------------------------------------------------
module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // Rate Limiting Check
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many search requests. Please wait a moment.' }));
    return;
  }

  // URL parsing
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const query = (url.searchParams.get('q') || req.query?.q || '').trim();
  const mediaFilter = (url.searchParams.get('type') || req.query?.type || 'all').toLowerCase();

  if (!query) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Search query parameter "q" is required.' }));
    return;
  }

  // Check In-Memory Cache
  const cacheKey = `${query}::${mediaFilter}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Cache', 'HIT');
    res.end(JSON.stringify(cached.data));
    return;
  }

  try {
    const data = await handleSearch(query, mediaFilter);

    // Save to Cache
    searchCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Cache', 'MISS');
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error('Search proxy error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Failed to retrieve streaming data.' }));
  }
};

// Also export helper methods for unit testing
module.exports.handleSearch = handleSearch;
module.exports.calculateRelevanceScore = calculateRelevanceScore;
module.exports.sortResults = sortResults;
module.exports.DEMO_DATABASE = DEMO_DATABASE;

