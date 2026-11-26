// Constants module for Cliffhanger
// Exported values are imported by client.js to keep the main script focused.
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';
export const STORAGE_KEY_THEME = 'cliffhanger_theme';

export const CANADIAN_PROVIDER_DIRECT_LINKS = {
  'Netflix': (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  'Crave': (title) => `https://www.crave.ca/en/search?q=${encodeURIComponent(title)}`,
  'Amazon Prime Video': (title) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
  'Disney Plus': (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  'Apple TV Plus': (title) => `https://tv.apple.com/ca/search?term=${encodeURIComponent(title)}`,
  'Apple TV': (title) => `https://tv.apple.com/ca/search?term=${encodeURIComponent(title)}`,
  'Paramount Plus': (title) => `https://www.paramountplus.com/ca/`,
  'CBC Gem': (title) => `https://gem.cbc.ca/search?q=${encodeURIComponent(title)}`,
  'Tubi TV': (title) => `https://tubitv.com/search/${encodeURIComponent(title)}`,
  'Club Illico': (title) => `https://illico.tv/`,
  'Pluto TV': (title) => `https://pluto.tv/en/search`
};

export const DEMO_DATABASE = [
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
      rent: [
        { provider_name: 'Apple TV', logo_path: 'https://images.justwatch.com/icon/190848813/s100/apple-tv.webp' }
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
      rent: [
        { provider_name: 'Apple TV', logo_path: 'https://images.justwatch.com/icon/190848813/s100/apple-tv.webp' },
        { provider_name: 'Cineplex', logo_path: 'https://images.justwatch.com/icon/128599729/s100/cineplex.webp' }
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
