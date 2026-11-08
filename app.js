/**
 * Cliffhanger 🇨🇦 - Where to Watch Movies & TV in Canada
 * WCAG 2.1 AA Compliant Client-side Application
 *
 * Architecture:
 * - Queries secure backend proxy at `/api/search` (Option 1).
 * - No user-facing API keys required on mobile or desktop.
 * - Automatic offline fallback to built-in Canadian Demo dataset.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration & Constants
  // ---------------------------------------------------------------------------
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';
  const STORAGE_KEY_THEME = 'cliffhanger_theme';

  // Direct search links for prominent Canadian streaming platforms
  const CANADIAN_PROVIDER_DIRECT_LINKS = {
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

  // ---------------------------------------------------------------------------
  // Built-in Demo Dataset (Canadian Streaming Availability Fallback)
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

  // ---------------------------------------------------------------------------
  // Relevance & Canadian Availability Sorting
  // ---------------------------------------------------------------------------
  function calculateRelevanceScore(item, query) {
    const q = (query || '').trim().toLowerCase();
    const t = (item.title || '').trim().toLowerCase();
    let score = 0;

    // 1. Title match quality
    if (t === q) {
      score += 1000;
    } else if (t.startsWith(q)) {
      score += 500;
    } else if (t.includes(` ${q} `) || t.startsWith(`${q}:`) || t.startsWith(`${q} `) || t.endsWith(` ${q}`)) {
      score += 250;
    } else if (t.includes(q)) {
      score += 100;
    }

    // 2. Canadian Subscription Streaming Availability Boost
    const hasSubscription = item.ca_providers?.flatrate && item.ca_providers.flatrate.length > 0;
    if (hasSubscription) {
      score += 200;
    } else if (item.ca_providers?.rent?.length || item.ca_providers?.buy?.length) {
      score += 50;
    }

    // 3. User Rating / Popularity as tie-breaker
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

  function searchDemoData(query, filter) {
    const qLower = query.toLowerCase().trim();
    const filtered = DEMO_DATABASE.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(qLower) || qLower.includes(item.title.toLowerCase());
      const matchesType = filter === 'all' || item.media_type === filter;
      return matchesQuery && matchesType;
    });

    return sortResults(filtered, query);
  }

  // ---------------------------------------------------------------------------
  // DOM Elements (Safely initialized in browser environments)
  // ---------------------------------------------------------------------------
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  const htmlRoot = isBrowser ? document.documentElement : null;
  const themeRadios = isBrowser ? document.querySelectorAll('input[name="theme"]') : [];
  const searchForm = isBrowser ? document.getElementById('search-form') : null;
  const searchInput = isBrowser ? document.getElementById('search-input') : null;
  const clearSearchBtn = isBrowser ? document.getElementById('clear-search-btn') : null;
  const searchSubmitBtn = isBrowser ? document.getElementById('search-submit-btn') : null;
  const searchSpinner = searchSubmitBtn ? searchSubmitBtn.querySelector('.spinner') : null;
  const searchBtnText = searchSubmitBtn ? searchSubmitBtn.querySelector('.btn-text') : null;
  const mediaTypeRadios = isBrowser ? document.querySelectorAll('input[name="mediaType"]') : [];
  const statusLiveRegion = isBrowser ? document.getElementById('status-live-region') : null;
  const resultsSection = isBrowser ? document.getElementById('results-section') : null;
  const resultsContainer = isBrowser ? document.getElementById('results-container') : null;
  const resultsCount = isBrowser ? document.getElementById('results-count') : null;
  const stateMessage = isBrowser ? document.getElementById('state-message') : null;
  const quickTags = isBrowser ? document.querySelectorAll('.tag-btn') : [];
  const backendStatusBadge = isBrowser ? document.getElementById('backend-status-badge') : null;
  const backendStatusText = isBrowser ? document.getElementById('backend-status-text') : null;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let activeTheme = (isBrowser && window.localStorage) ? (localStorage.getItem(STORAGE_KEY_THEME) || 'system') : 'system';
  let isSearching = false;

  // ---------------------------------------------------------------------------
  // Accessibility Live Region Announcement Helper
  // ---------------------------------------------------------------------------
  function announceStatus(message) {
    if (!statusLiveRegion) return;
    statusLiveRegion.textContent = '';
    window.setTimeout(() => {
      statusLiveRegion.textContent = message;
    }, 50);
  }

  // ---------------------------------------------------------------------------
  // Theme Management (Light, Dark, System)
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    activeTheme = theme;
    if (isBrowser && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    }
    if (htmlRoot) {
      htmlRoot.setAttribute('data-theme', theme);
    }

    themeRadios.forEach(radio => {
      radio.checked = radio.value === theme;
    });
  }

  function initTheme() {
    applyTheme(activeTheme);

    themeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          applyTheme(e.target.value);
          announceStatus(`Color theme changed to ${e.target.value}`);
        }
      });
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (activeTheme === 'system' && htmlRoot) {
        htmlRoot.setAttribute('data-theme', 'system');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Backend Status Badge
  // ---------------------------------------------------------------------------
  function updateBackendStatusUI(isDemo) {
    if (!backendStatusBadge || !backendStatusText) return;
    if (isDemo) {
      backendStatusBadge.className = 'badge badge-demo';
      backendStatusText.textContent = 'Demo Mode (Add TMDB_API_KEY)';
      backendStatusBadge.title = 'Running on Canadian sample dataset. Set TMDB_API_KEY in host environment for all titles.';
    } else {
      backendStatusBadge.className = 'badge badge-active';
      backendStatusText.textContent = 'Canada Live';
      backendStatusBadge.title = 'Connected to live Canadian streaming availability service.';
    }
  }

  // ---------------------------------------------------------------------------
  // Search Form & Input Handling
  // ---------------------------------------------------------------------------
  function getSelectedMediaType() {
    const selected = document.querySelector('input[name="mediaType"]:checked');
    return selected ? selected.value : 'all';
  }

  function updateClearBtnVisibility() {
    if (!clearSearchBtn || !searchInput) return;
    clearSearchBtn.hidden = searchInput.value.trim().length === 0;
  }

  function initSearchControls() {
    if (!searchInput) return;

    searchInput.addEventListener('input', updateClearBtnVisibility);

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      updateClearBtnVisibility();
      searchInput.focus();
      hideResults();
      hideStateMessage();
      announceStatus('Search cleared');
    });

    // Keyboard shortcut: '/' focuses search input, 'Esc' clears search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === 'Escape' && searchInput.value) {
        searchInput.value = '';
        updateClearBtnVisibility();
        hideResults();
        hideStateMessage();
        announceStatus('Search cleared');
      }
    });

    mediaTypeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (searchInput.value.trim()) {
          executeSearch(searchInput.value.trim());
        }
      });
    });

    quickTags.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        searchInput.value = query;
        updateClearBtnVisibility();
        executeSearch(query);
      });
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) {
        searchInput.focus();
        announceStatus('Please enter a movie or TV show title to search.');
        return;
      }
      executeSearch(query);
    });
  }

  // ---------------------------------------------------------------------------
  // Search Execution & Data Fetching (Option 1 Backend Proxy)
  // ---------------------------------------------------------------------------
  function setLoadingState(loading) {
    isSearching = loading;
    if (searchSubmitBtn) {
      searchSubmitBtn.disabled = loading;
      searchSubmitBtn.setAttribute('aria-busy', String(loading));
    }
    if (searchSpinner) searchSpinner.hidden = !loading;
    if (searchBtnText) searchBtnText.textContent = loading ? 'Searching...' : 'Find Streaming Service';
  }

  function hideResults() {
    if (resultsSection) resultsSection.hidden = true;
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (resultsCount) resultsCount.textContent = '';
  }

  function hideStateMessage() {
    if (stateMessage) {
      stateMessage.hidden = true;
      stateMessage.innerHTML = '';
    }
  }

  function showStateMessage({ icon, title, text, actionBtn }) {
    hideResults();
    if (!stateMessage) return;
    stateMessage.hidden = false;
    stateMessage.innerHTML = `
      <div class="state-icon" aria-hidden="true">${icon}</div>
      <h3 class="state-title">${title}</h3>
      <p class="state-text">${text}</p>
      ${actionBtn ? `<button type="button" class="btn btn-secondary" id="state-action-btn">${actionBtn.text}</button>` : ''}
    `;
    if (actionBtn) {
      document.getElementById('state-action-btn')?.addEventListener('click', actionBtn.onClick);
    }
  }

  async function executeSearch(query) {
    if (isSearching) return;
    setLoadingState(true);
    hideStateMessage();
    announceStatus(`Searching for "${query}" in Canada...`);

    const mediaFilter = getSelectedMediaType();

    try {
      let results = [];
      let isDemo = false;

      // Query secure backend proxy endpoint
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(mediaFilter)}`);
        if (response.ok) {
          const payload = await response.json();
          results = payload.results || [];
          isDemo = Boolean(payload.isDemo);
          updateBackendStatusUI(isDemo);
        } else {
          throw new Error(`API returned HTTP ${response.status}`);
        }
      } catch (networkErr) {
        // Offline / file:// protocol fallback
        console.warn('Backend proxy unreachable, falling back to local demo dataset:', networkErr);
        results = searchDemoData(query, mediaFilter);
        isDemo = true;
        updateBackendStatusUI(true);
      }

      setLoadingState(false);

      if (!results || results.length === 0) {
        showZeroResultsState(query, isDemo);
      } else {
        renderResults(results, query);
      }
    } catch (err) {
      console.error('Search error:', err);
      setLoadingState(false);
      showErrorState(err.message || 'An error occurred while fetching streaming data.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render Results (WCAG 2.1 AA Compliant Cards)
  // ---------------------------------------------------------------------------
  function getStreamingServiceDirectUrl(providerName, title, justwatchUrl) {
    if (CANADIAN_PROVIDER_DIRECT_LINKS[providerName]) {
      return CANADIAN_PROVIDER_DIRECT_LINKS[providerName](title);
    }
    return justwatchUrl || `https://www.justwatch.com/ca/search?q=${encodeURIComponent(title)}`;
  }

  function renderResults(items, query) {
    if (!resultsContainer || !resultsSection) return;
    resultsContainer.innerHTML = '';
    resultsSection.hidden = false;

    const countText = `${items.length} ${items.length === 1 ? 'title' : 'titles'} found in Canada`;
    if (resultsCount) resultsCount.textContent = countText;
    announceStatus(`Search complete. ${countText} for "${query}".`);

    items.forEach(item => {
      const card = createShowCard(item);
      resultsContainer.appendChild(card);
    });

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function createShowCard(item) {
    const card = document.createElement('article');
    card.className = 'show-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-labelledby', `title-${item.id}`);

    const typeLabel = item.media_type === 'movie' ? 'Movie' : 'TV Series';
    const yearDisplay = item.year ? `(${item.year})` : '';

    let posterHtml = '';
    if (item.poster_path) {
      posterHtml = `
        <div class="poster-container">
          <img 
            src="${item.poster_path}" 
            alt="Promotional poster for ${escapeHtml(item.title)}" 
            class="poster-image" 
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'poster-fallback\\'><span aria-hidden=\\'true\\'>🎬</span><span>No Poster Available</span></div>'"
          >
        </div>
      `;
    } else {
      posterHtml = `
        <div class="poster-container">
          <div class="poster-fallback">
            <span aria-hidden="true" style="font-size: 2rem;">🎬</span>
            <span>No Poster Available</span>
          </div>
        </div>
      `;
    }

    let streamingHtml = '';
    const ca = item.ca_providers;

    if (ca && ca.flatrate && ca.flatrate.length > 0) {
      const providerListItems = ca.flatrate.map(p => {
        const directUrl = getStreamingServiceDirectUrl(p.provider_name, item.title, ca.justwatch_url);
        const logoHtml = p.logo_path 
          ? `<img src="${p.logo_path}" alt="" aria-hidden="true" class="provider-logo">` 
          : `<span aria-hidden="true">📺</span>`;

        return `
          <li class="provider-item">
            <a 
              href="${directUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="provider-link" 
              aria-label="Stream ${escapeHtml(item.title)} on ${escapeHtml(p.provider_name)} in Canada (opens in a new tab)"
            >
              ${logoHtml}
              <span>${escapeHtml(p.provider_name)}</span>
              <span class="external-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        `;
      }).join('');

      streamingHtml = `
        <div class="streaming-section">
          <div class="streaming-heading">
            <span>Streaming in Canada On:</span>
            <span class="badge badge-active">Available</span>
          </div>
          <ul class="provider-list" aria-label="Canadian subscription streaming platforms">
            ${providerListItems}
          </ul>
          ${ca.justwatch_url ? `
            <a 
              href="${ca.justwatch_url}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="watch-hub-cta"
              aria-label="View all Canadian streaming, rental, and purchase options for ${escapeHtml(item.title)} on JustWatch (opens in a new tab)"
            >
              <span>View full Canada streaming guide on JustWatch</span>
              <span aria-hidden="true">↗</span>
            </a>
          ` : ''}
        </div>
      `;
    } else {
      let extraOptions = '';
      if (ca && (ca.rent?.length || ca.buy?.length)) {
        const optionsList = [...(ca.rent || []), ...(ca.buy || [])]
          .map(p => p.provider_name)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 4)
          .join(', ');

        extraOptions = `
          <div class="buy-rent-options">
            Available to rent or buy digitally on: <strong>${escapeHtml(optionsList)}</strong>
          </div>
        `;
      }

      streamingHtml = `
        <div class="streaming-section">
          <div class="not-streaming-notice">
            <strong>Not currently on subscription streaming in Canada.</strong>
            ${extraOptions}
          </div>
          ${ca?.justwatch_url ? `
            <a 
              href="${ca.justwatch_url}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="watch-hub-cta"
              aria-label="Check rental and digital purchase availability for ${escapeHtml(item.title)} in Canada on JustWatch (opens in a new tab)"
            >
              <span>Check for digital rental or purchase options</span>
              <span aria-hidden="true">↗</span>
            </a>
          ` : ''}
        </div>
      `;
    }

    card.innerHTML = `
      ${posterHtml}
      <div class="card-content">
        <div class="card-header-row">
          <span class="media-type-badge">${typeLabel}</span>
          ${item.vote_average ? `
            <div class="card-score" aria-label="Rating: ${item.vote_average} out of 10">
              <span class="star-icon" aria-hidden="true">★</span>
              <span>${item.vote_average}</span>
            </div>
          ` : ''}
        </div>

        <h3 id="title-${item.id}" class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-meta">${typeLabel} ${yearDisplay}</p>
        <p class="card-overview">${escapeHtml(item.overview)}</p>

        ${streamingHtml}
      </div>
    `;

    return card;
  }

  // ---------------------------------------------------------------------------
  // Empty & Error States
  // ---------------------------------------------------------------------------
  function showZeroResultsState(query, isDemo) {
    let hint = 'Try checking for typos or searching with a different title keyword.';
    if (isDemo) {
      hint = `In Demo Mode, try searching titles like <strong>"The Last of Us", "Dune", "Succession", "Schitt's Creek", "Fallout", "Stranger Things"</strong>, or add your free TMDB API key to the server environment to search any title.`;
    }

    showStateMessage({
      icon: '🔍',
      title: `No streaming results found for "${escapeHtml(query)}"`,
      text: hint
    });

    announceStatus(`No streaming results found for "${query}" in Canada.`);
  }

  function showErrorState(errorMessage) {
    showStateMessage({
      icon: '⚠️',
      title: 'Unable to Complete Search',
      text: escapeHtml(errorMessage)
    });

    announceStatus(`Search error: ${errorMessage}`);
  }

  // ---------------------------------------------------------------------------
  // Helper: HTML Escaping
  // ---------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------------------------------------------------------------------------
  // Initialization & Environment Support
  // ---------------------------------------------------------------------------
  function init() {
    if (!isBrowser) return;
    initTheme();
    initSearchControls();
  }

  if (isBrowser) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Export pure functions for Node.js unit testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      calculateRelevanceScore,
      sortResults,
      searchDemoData,
      getStreamingServiceDirectUrl,
      escapeHtml,
      DEMO_DATABASE,
      CANADIAN_PROVIDER_DIRECT_LINKS
    };
  }

})();
