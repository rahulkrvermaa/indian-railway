# 🚂 RailGaadi

<div align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="MapLibre" src="https://img.shields.io/badge/MapLibre-GL-blue?style=for-the-badge&logo=maplibre" />
</div>

<br />

**RailGaadi** is a real-time Indian Railways tracking web application. It combines live journey data, interactive route maps, delay analytics, weather information, and terrain points of interest in a clean and highly responsive interface.

---

## ✨ Features

- 🔍 **Smart Search:** Search Indian train numbers, names, origins, and destinations.
- 📍 **Live Tracking:** View live journey status, current location, delays, ETA, and a complete station timeline.
- 🗺️ **Interactive Maps:** Explore train routes visually with an interactive MapLibre map.
- 📊 **Analytics:** Review delay analytics and elevation profiles for train journeys.
- 🌤️ **Weather Integration:** Display current weather conditions for journey stations.
- 🏞️ **Terrain & POIs:** Display bridges, tunnels, rivers, peaks, attractions, and cities using OpenStreetMap Overpass data.
- ⭐ **Personalization:** Save favorite trains and easily share journey links with others.
- 📱 **PWA Support:** Responsive mobile and desktop navigation with a PWA manifest and application icons.

## 🛠 Technology Stack

### Frontend & Core
- **[Next.js 14](https://nextjs.org/)** - App Router for rendering and API routes
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe codebase
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animations

### State & Data Management
- **[React Query](https://tanstack.com/query/latest)** - Data fetching and caching
- **[Zustand](https://github.com/pmndrs/zustand)** - Global state management

### Maps & Geospatial
- **[MapLibre GL](https://maplibre.org/)** - Interactive map rendering
- **[Turf.js](https://turfjs.org/)** - Geospatial analysis

## 🚀 Local Development

### Requirements

- Node.js 18 or later
- npm

### Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/rahulkrvermaa/indian-railway.git
   cd indian-railway
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Add the required values to `.env.local`:**

| Variable | Scope | Required | Purpose |
| --- | --- | ---: | --- |
| `RAILRADAR_API_KEY` | Server | Yes | Live train and route data |
| `OPENWEATHER_API_KEY` | Server | Yes | Station weather data |
| `NEXT_PUBLIC_MAPTILER_API_KEY` | Browser | Optional | MapTiler map styles; falls back to CARTO tiles |
| `OPENTOPOGRAPHY_API_KEY` | Server | Optional | Real elevation data; local model used when unset |
| `UPSTASH_REDIS_REST_URL` | Server | Optional | Future distributed caching |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Optional | Future distributed caching |

> ⚠️ **Note:** The `.env.local` file is excluded from Git. Never commit your API keys or tokens.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint to catch issues |

## ☁️ Deployment

### Vercel (Recommended)

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Select the `main` branch and keep the default Next.js build settings.
4. Add the environment variables listed above in **Project Settings > Environment Variables**.
5. Deploy the project!

Vercel automatically serves the generated Next.js application. Server-side API keys remain available only to server functions and are not exposed to the browser.

## 📁 Project Structure

```text
app/                 Next.js pages and API routes
components/          Shared UI components
features/            Journey, map, weather, terrain, and analytics features
hooks/               React data-fetching hooks
lib/                 API clients, caching, and data utilities
providers/           Application providers
public/              Static assets and PWA manifest
store/               Zustand state stores
styles/              Global styles
types/               Shared TypeScript types
utils/               Small utility functions
```

## ℹ️ Data and Service Notes

- **Train data** is requested through the RailRadar API, with a local fallback for supported trains when the live service is unavailable.
- **Weather data** comes from OpenWeatherMap, with a deterministic fallback response.
- **Map tiles** use MapTiler when configured and CARTO/OpenStreetMap tiles otherwise.
- **Terrain POIs** are queried from the OpenStreetMap Overpass API. Requests include an identifying `User-Agent` and `Referer`, use a secondary endpoint when needed, and return an empty result if the service is temporarily unavailable.
- OpenStreetMap data is available under the Open Database License.

## 🔗 Links

- **Repository:** https://github.com/rahulkrvermaa/indian-railway
