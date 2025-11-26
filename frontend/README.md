# Football Match Tracker - Frontend

React + TypeScript + Vite frontend with real-time updates via Server-Sent Events.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

## Build

```bash
npm run build
npm run preview
```

## Features

### Match List Page (`/`)

-   Displays all matches organized by status (Live, Upcoming, Ended)
-   Real-time score updates for live matches via SSE
-   Visual indicators for match status
-   Click "View Details" to see individual match
-   **Admin Panel** button in header to access match management

### Admin Panel Page (`/admin`)

-   **Create Custom Matches**: Form to create matches with custom team names
-   **Seed Sample Matches**: One-click button to create 5 pre-configured matches
-   **Start Matches**: View and start any match in "Ready to Start" section
-   **Match Management**: See all matches organized by status (Ready, Live, Ended)
-   **Quick Actions**: Refresh match list and seed data
-   Real-time feedback with success/error messages

### Match Detail Page (`/matches/:id`)

-   Shows current score and team names
-   Live event feed with icons and colors
-   Events include: match start, goals, cards, fouls, match end
-   Chronological display of all match events
-   Real-time updates via SSE connection

## Tech Stack

-   **React 18** - UI framework
-   **TypeScript** - Type safety
-   **Vite** - Fast build tool
-   **React Router** - Client-side routing
-   **Tailwind CSS v4** - Styling
-   **EventSource** - SSE client

## Project Structure

```
src/
├── pages/
│   ├── MatchList.tsx      # Home page with all matches
│   ├── MatchDetail.tsx    # Individual match view
│   └── Admin.tsx          # Admin panel for match management
├── components/
│   └── MatchCard.tsx      # Reusable match card component
├── lib/
│   └── api.ts             # API client and SSE handling
├── types.ts               # TypeScript type definitions
├── App.tsx                # Main app with routing
├── main.tsx               # Entry point
└── index.css              # Tailwind imports
```

## API Integration

The frontend communicates with the backend at `http://localhost:8000`.

### REST API

-   `GET /matches` - Fetch all matches
-   `GET /matches/:id` - Fetch single match

### SSE (Server-Sent Events)

-   `GET /matches/:id/events/stream` - Subscribe to match events

The `api.ts` module handles all backend communication:

```typescript
import { api } from "./lib/api";

// Fetch matches
const matches = await api.getMatches();

// Subscribe to SSE
const eventSource = api.subscribeToMatch(matchId, (event) => {
	console.log("New event:", event);
});

// Clean up
eventSource.close();
```

## SSE Event Handling

The app uses React hooks to manage SSE connections:

```typescript
useEffect(() => {
	const eventSource = api.subscribeToMatch(matchId, (event) => {
		// Update state with new event
		handleMatchEvent(event);
	});

	return () => {
		eventSource.close(); // Clean up on unmount
	};
}, [matchId]);
```

## Styling

Tailwind CSS v4 is configured with:

-   Responsive grid layouts
-   Custom color schemes for match statuses
-   Hover effects and transitions
-   Mobile-first design

## Development Tips

1. **Ensure backend is running** on port 8000 before starting frontend
2. **Use browser DevTools** to inspect SSE connections (Network tab)
3. **Check console** for SSE connection errors or event parsing issues
4. **Hot reload** is enabled - changes appear instantly

## Environment

The API base URL is hardcoded in `src/lib/api.ts`. For production, use environment variables:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
```

Create `.env` file:

```
VITE_API_BASE=https://your-api-domain.com
```

## Browser Compatibility

EventSource (SSE) is supported in all modern browsers:

-   Chrome/Edge
-   Firefox
-   Safari
-   Opera

Not supported in Internet Explorer.
