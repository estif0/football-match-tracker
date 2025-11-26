# ⚽ Football Match Tracker

A full-stack demo application showcasing real-time match updates using **Server-Sent Events (SSE)**. Watch live football matches with automatic event generation and real-time score updates.

## Architecture

-   **Frontend**: React + TypeScript + Vite + Tailwind CSS (Port 5173)
-   **Backend**: Node.js + Express + TypeScript (Port 8000)
-   **Transport**: Server-Sent Events (EventSource API)
-   **Storage**: In-memory (no database)

## Features

✅ Real-time match updates via SSE  
✅ **Admin Panel UI** for creating and managing matches  
✅ Automatic event simulation (goals, cards, fouls)  
✅ Multiple concurrent matches supported  
✅ Matches auto-end after 5 minutes  
✅ Clean, professional UI with Tailwind CSS  
✅ Full TypeScript type safety  
✅ No authentication required (demo app)

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

Backend runs on **http://localhost:8000**

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

### 4. Use the Admin Panel

Open **http://localhost:5173** in your browser.

#### Click "Admin Panel" button in the top right corner

From the Admin Panel (`/admin`), you can:

1. **Create Custom Match**

    - Enter Team A name (e.g., "Arsenal")
    - Enter Team B name (e.g., "Chelsea")
    - Click "Create Match"

2. **Seed Sample Matches**

    - Click "🌱 Seed Sample Matches" button
    - Creates 5 pre-configured matches instantly

3. **Start Matches**

    - View all matches organized by status
    - Click "▶ Start Match" button for any match in "Ready to Start" section
    - Match will immediately go live with automatic event generation

4. **Watch Live Matches**
    - Click "Watch Live" to view real-time events
    - Or return to home page to see all live matches

Once started, the match will:

-   Broadcast `match_started` event
-   Generate random goals, cards, and fouls
-   Update scores in real-time
-   Auto-end after 5 minutes with `match_ended` event

### 5. View Matches

On the home page (`/`), you'll see:

-   Live match list with real-time score updates
-   Click any match to view detailed event feed
-   Events appear instantly via SSE

## Project Structure

```
football-match-tracker/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express server
│   │   ├── types.ts            # Type definitions
│   │   ├── store.ts            # In-memory data store
│   │   ├── simulator.ts        # Match event generator
│   │   ├── sse/
│   │   │   └── broadcaster.ts  # SSE connection manager
│   │   └── routes/
│   │       ├── admin.ts        # Admin endpoints
│   │       └── matches.ts      # Public endpoints
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MatchList.tsx   # Home page
│   │   │   ├── MatchDetail.tsx # Match view
│   │   │   └── Admin.tsx       # Admin panel
│   │   ├── components/
│   │   │   └── MatchCard.tsx   # Match card component
│   │   ├── lib/
│   │   │   └── api.ts          # API client + SSE
│   │   ├── types.ts            # Type definitions
│   │   ├── App.tsx             # Main app
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Tailwind imports
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
└── README.md (this file)
```

## API Endpoints

### Admin Routes

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| POST   | `/admin/matches`           | Create a new match      |
| POST   | `/admin/matches/:id/start` | Start match simulation  |
| POST   | `/admin/seed`              | Create 5 sample matches |

### Public Routes

| Method | Endpoint                     | Description       |
| ------ | ---------------------------- | ----------------- |
| GET    | `/matches`                   | List all matches  |
| GET    | `/matches/:id`               | Get match details |
| GET    | `/matches/:id/events/stream` | SSE event stream  |

## SSE Event Types

Events are sent as JSON:

```json
{
	"type": "goal",
	"timestamp": "2025-11-26T10:30:00.000Z",
	"matchId": "match-123",
	"team": "A",
	"player": "Silva",
	"score": { "a": 1, "b": 0 },
	"details": "Goal scored by Silva!"
}
```

Types: `match_started`, `goal`, `card`, `foul`, `match_ended`

## Testing SSE with curl

```bash
# Subscribe to match events
curl -N --no-buffer http://localhost:8000/matches/MATCH_ID/events/stream
```

The `-N` and `--no-buffer` flags are required for SSE to work with curl.

## Testing Flow

### Using the UI (Recommended)

1. Open **http://localhost:5173**
2. Click **"Admin Panel"** button
3. Click **"🌱 Seed Sample Matches"**
4. In "Ready to Start" section, click **"▶ Start Match"** on any match
5. Click **"Watch Live"** or return to home page to see live updates
6. View real-time events as they happen

### Using curl (Alternative)

1. **Seed matches**: `curl -X POST http://localhost:8000/admin/seed`
2. **Get match list**: `curl http://localhost:8000/matches`
3. **Start a match**: `curl -X POST http://localhost:8000/admin/matches/MATCH_ID/start`
4. **Watch events**: `curl -N --no-buffer http://localhost:8000/matches/MATCH_ID/events/stream`

## Development

### Backend Development

```bash
cd backend
npm run dev      # Start with hot reload
npm run build    # Build for production
npm start        # Run production build
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

## How It Works

### Backend

1. Express server listens on port 8000
2. When a match starts, `simulator.ts` generates random events
3. Events are broadcast via `broadcaster.ts` to all connected SSE clients
4. Match ends automatically after 5 minutes

### Frontend

1. `MatchList` page (`/`) displays all matches with real-time updates
2. `Admin` page (`/admin`) provides UI for creating and managing matches
3. For live matches, subscribes to SSE streams
4. `MatchDetail` page (`/matches/:id`) shows full event feed
5. React state updates trigger re-renders on new events

### SSE Connection

-   Browser uses `EventSource` API
-   Server sends `Content-Type: text/event-stream`
-   Events format: `data: {...}\n\n`
-   Automatic reconnection on disconnect

## Production Considerations

This is a **demo application**. For production:

-   [ ] Add persistent database (PostgreSQL, MongoDB)
-   [ ] Add authentication and authorization
-   [ ] Use Redis for pub/sub instead of in-memory broadcaster
-   [ ] Add rate limiting and input validation
-   [ ] Deploy backend and frontend separately
-   [ ] Add error boundaries and loading states
-   [ ] Use environment variables for API URLs
-   [ ] Add logging and monitoring
-   [ ] Implement proper CORS policies
-   [ ] Add unit and integration tests

## Technologies

-   **Backend**: Node.js, Express, TypeScript, tsx
-   **Frontend**: React 18, TypeScript, Vite, React Router, Tailwind CSS v4
-   **Transport**: Server-Sent Events (EventSource)
-   **Development**: Hot reload, TypeScript strict mode

## License

ISC

## Notes

-   All data is lost on server restart (in-memory only)
-   Matches automatically end after 5 minutes
-   CORS is configured for `http://localhost:5173`
-   EventSource is supported in all modern browsers (not IE)
-   SSE is one-way (server → client); use WebSockets for bidirectional

---
