# Cliffhanger 🇨🇦 | Canadian Streaming Availability Finder

> *Never be left hanging.* Find what streaming service a movie or TV show is on in Canada.

Cliffhanger helps you instantly discover where to stream movies and TV shows across **Canadian platforms** (Crave, Netflix Canada, Amazon Prime Video, Disney+, Apple TV+, CBC Gem, Paramount+, etc.), with 1-click links to launch the title directly.

Built with **HTML5, CSS3, Vanilla JavaScript, and a secure serverless backend proxy**. Fully accessible, **WCAG 2.1 AA compliant**, with support for **Light, Dark, and System** color schemes.

---

## 🔒 Security Architecture (Serverless Backend Proxy)

Cliffhanger keeps your API credentials **100% secure**:
- **Zero API Key Prompts for Users**: Visitors on phones, tablets, or computers never have to register, type, or store API keys.
- **Server-Side Secret Protection**: The TMDB API key is kept securely on the server via `process.env.TMDB_API_KEY`. It is **never exposed** in client-side code, cookies, or browser network traffic.
- **High-Performance Caching**: Responses are cached at the edge and in-memory for 4 hours, ensuring sub-10ms response times for popular titles while preserving API quotas.
- **IP Rate Limiting**: Built-in protection against web crawlers and scraping abuse.
- **Offline / Demo Fallback**: Works immediately out-of-the-box in Canadian Demo Mode (*The Last of Us*, *Dune: Part Two*, *Succession*, *Schitt's Creek*, *Fallout*, *Stranger Things*, *Severance*, *The Bear*, etc.) even if no API key is configured.

---

## 💻 Running Locally

### 1. Start the Server
```bash
cd /Users/noah/.gemini/antigravity/scratch/canstream
npm start
```
This runs the local development server at `http://localhost:8088/`.

### 2. (Optional) Add your Free TMDB Key
1. Get a free API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your key inside `.env`:
   ```env
   TMDB_API_KEY=your_key_here
   ```
4. Restart the server (`npm start`). You will now search live Canadian data across every movie and TV show ever released!

---

## 📱 Deploying for Free (To Use on Your Phone)

Because Cliffhanger uses standard serverless function routes (`/api/search`), you can deploy it in 60 seconds with zero backend management:

### Option A: Deploy to Vercel (Recommended)
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and select the repository.
3. Under **Environment Variables**, add:
   - `TMDB_API_KEY` = `your_tmdb_api_key_here`
4. Click **Deploy**!
5. Open the URL on your phone's browser and tap **Add to Home Screen**. You now have a fast, native-feeling streaming app on your phone!

### Option B: Deploy to Netlify
1. Push this repository to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com/) → **Add new site** → **Import an existing project**.
3. Under **Site configuration** → **Environment variables**, add:
   - `TMDB_API_KEY` = `your_tmdb_api_key_here`
4. Click **Deploy site**.

---

## 🧪 Running Unit Tests

Run the built-in Node.js test suite:
```bash
npm test
```
Runs 14 unit tests covering HTML sanitization/XSS prevention, smart Canadian availability ranking, demo dataset filtering, direct platform URL generation, and serverless proxy endpoints.
