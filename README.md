# RailGaadi

RailGaadi is a real-time Indian Railways tracking web application. It combines live journey data, interactive route maps, delay analytics, weather information, and terrain points of interest in a responsive interface.

## Features

- Search Indian train numbers, names, origins, and destinations
- View live journey status, current location, delay, ETA, and station timeline
- Explore routes with an interactive MapLibre map
- Review delay analytics and elevation profiles
- Display weather conditions for journey stations
- Display bridges, tunnels, rivers, peaks, attractions, and cities using OpenStreetMap Overpass data
- Save favorite trains and share journey links
- Responsive mobile and desktop navigation
- PWA manifest with application icons

## Technology

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- MapLibre GL
- React Query
- Zustand
- Turf.js

## Local development

Requirements:

- Node.js 18 or later
- npm

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Add the required values to `.env.local`:

| Variable | Scope | Required | Purpose |
| --- | --- | ---: | --- |
| `RAILRADAR_API_KEY` | Server | Yes | Live train and route data |
| `OPENWEATHER_API_KEY` | Server | Yes | Station weather data |
| `NEXT_PUBLIC_MAPTILER_API_KEY` | Browser | Optional | MapTiler map styles; the app falls back to CARTO tiles when unset |
| `OPENTOPOGRAPHY_API_KEY` | Server | Optional | Real elevation data; a local elevation model is used when unset |
| `UPSTASH_REDIS_REST_URL` | Server | Optional | Future distributed caching |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Optional | Future distributed caching |

The `.env.local` file is excluded from Git. Never commit API keys or tokens.

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev       # Start Next.js development server
npm run build     # Create a production build
npm start         # Start the production server
npm run lint      # Run ESLint
```

## Deployment with Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Select the `main` branch and keep the default Next.js build settings.
4. Add the environment variables listed above in **Project Settings > Environment Variables**.
5. Deploy the project.

The production build command is:

```bash
npm run build
```

Vercel automatically serves the generated Next.js application. Server-side API keys remain available only to server functions and are not exposed to the browser.

## Project structure

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

## Data and service notes

- Train data is requested through the RailRadar API, with a local fallback for supported trains when the live service is unavailable.
- Weather data comes from OpenWeatherMap, with a deterministic fallback response.
- Map tiles use MapTiler when configured and CARTO/OpenStreetMap tiles otherwise.
- Terrain points of interest are queried from the OpenStreetMap Overpass API. Requests include an identifying `User-Agent` and `Referer`, use a secondary endpoint when needed, and return an empty result if the service is temporarily unavailable.
- OpenStreetMap data is available under the Open Database License.

## Repository

https://github.com/rahulkrvermaa/indian-railway
