/**
 * Cliffhanger Unit Tests
 * Runs with Node.js built-in test runner: `node --test`
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateRelevanceScore,
  sortResults,
  searchDemoData,
  getStreamingServiceDirectUrl,
  escapeHtml,
  DEMO_DATABASE,
  CANADIAN_PROVIDER_DIRECT_LINKS
} = require('../client.js');
const apiSearch = require('../api/search.js');

describe('HTML Escaping & Security', () => {
  it('escapes dangerous HTML characters to prevent XSS', () => {
    assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    assert.equal(escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#039;s');
  });

  it('handles empty or null values gracefully', () => {
    assert.equal(escapeHtml(''), '');
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
  });
});

describe('Relevance & Ordering Algorithm', () => {
  it('ranks exact title matches higher than partial substring matches', () => {
    const exact = { title: 'Severance', ca_providers: { flatrate: [] }, vote_average: 8.0 };
    const partial = { title: 'Severance: Behind The Scenes', ca_providers: { flatrate: [] }, vote_average: 8.0 };

    const scoreExact = calculateRelevanceScore(exact, 'severance');
    const scorePartial = calculateRelevanceScore(partial, 'severance');

    assert.ok(scoreExact > scorePartial, `Expected exact match score (${scoreExact}) > partial (${scorePartial})`);
  });

  it('boosts titles that are currently streaming on subscription in Canada', () => {
    const streamingInCanada = {
      title: 'Sample Show A',
      ca_providers: {
        flatrate: [{ provider_name: 'Crave' }]
      },
      vote_average: 7.0
    };

    const notStreamingInCanada = {
      title: 'Sample Show B',
      ca_providers: {
        flatrate: []
      },
      vote_average: 7.0
    };

    const scoreStream = calculateRelevanceScore(streamingInCanada, 'Sample');
    const scoreNoStream = calculateRelevanceScore(notStreamingInCanada, 'Sample');

    assert.ok(scoreStream > scoreNoStream, 'Titles streamable on subscription in Canada should rank higher');
  });

  it('sorts an array of results with streamable exact matches at the very top', () => {
    const items = [
      { id: 1, title: 'Severance Discussion', ca_providers: { flatrate: [] }, vote_average: 7.0 },
      { id: 2, title: 'Severance', ca_providers: { flatrate: [{ provider_name: 'Apple TV Plus' }] }, vote_average: 8.4 },
      { id: 3, title: 'The Making of Severance', ca_providers: { flatrate: [] }, vote_average: 6.5 }
    ];

    const sorted = sortResults(items, 'severance');
    assert.equal(sorted[0].id, 2, 'Exact streamable title must be first');
  });
});

describe('Demo Dataset & Search Functionality', () => {
  it('finds "Severance" and confirms it is on Apple TV Plus in Canada', () => {
    const results = searchDemoData('severance', 'all');
    assert.ok(results.length >= 1, 'Should find at least 1 result for Severance');
    const severance = results[0];
    assert.equal(severance.title, 'Severance');
    assert.equal(severance.media_type, 'tv');
    assert.ok(severance.ca_providers.flatrate.some(p => p.provider_name === 'Apple TV Plus'));
  });

  it('filters results by media type correctly (movies only vs tv only)', () => {
    const tvResults = searchDemoData('Dune', 'tv');
    assert.equal(tvResults.length, 0, 'Dune is a movie in our demo dataset, not a TV show');

    const movieResults = searchDemoData('Dune', 'movie');
    assert.ok(movieResults.length >= 1, 'Should find Dune under movie filter');
    assert.equal(movieResults[0].title, 'Dune: Part Two');
  });

  it('handles case-insensitivity seamlessly', () => {
    const lower = searchDemoData("schitt's creek", 'all');
    const upper = searchDemoData("SCHITT'S CREEK", 'all');
    assert.equal(lower.length, upper.length);
    assert.equal(lower[0].title, "Schitt's Creek");
  });
});

describe('Canadian Streaming Platform Links', () => {
  it('generates direct search link for Crave in Canada', () => {
    const craveUrl = getStreamingServiceDirectUrl('Crave', 'The Last of Us', 'https://justwatch.com/ca/dummy');
    assert.equal(craveUrl, 'https://www.crave.ca/en/search?q=The%20Last%20of%20Us');
  });

  it('generates direct search link for Netflix in Canada', () => {
    const netflixUrl = getStreamingServiceDirectUrl('Netflix', 'Stranger Things', 'https://justwatch.com/ca/dummy');
    assert.equal(netflixUrl, 'https://www.netflix.com/search?q=Stranger%20Things');
  });

  it('generates direct search link for Disney Plus in Canada', () => {
    const disneyUrl = getStreamingServiceDirectUrl('Disney Plus', 'The Bear', 'https://justwatch.com/ca/dummy');
    assert.equal(disneyUrl, 'https://www.disneyplus.com/search?q=The%20Bear');
  });

  it('falls back to JustWatch Canada URL when provider is not in direct list', () => {
    const fallbackUrl = getStreamingServiceDirectUrl('Criterion Channel', 'Seven Samurai', 'https://www.justwatch.com/ca/movie/seven-samurai');
    assert.equal(fallbackUrl, 'https://www.justwatch.com/ca/movie/seven-samurai');
  });
});

describe('Serverless Backend Proxy (Option 1)', () => {
  it('handles search and returns structured results with Canadian availability', async () => {
    const data = await apiSearch.handleSearch('Severance', 'all');
    assert.ok(data.results, 'Response must have results array');
    assert.ok(data.results.length >= 1);
    assert.equal(data.results[0].title, 'Severance');
    assert.ok(data.results[0].ca_providers.flatrate.length > 0);
  });

  it('filters by media type in backend proxy (movie vs tv)', async () => {
    const tvData = await apiSearch.handleSearch('Dune', 'tv');
    assert.equal(tvData.results.length, 0);

    const movieData = await apiSearch.handleSearch('Dune', 'movie');
    assert.ok(movieData.results.length >= 1);
    assert.equal(movieData.results[0].title, 'Dune: Part Two');
  });
});
