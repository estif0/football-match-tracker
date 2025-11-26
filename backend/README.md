# Football Match Tracker - Backend

Express + TypeScript backend with Server-Sent Events (SSE) for real-time match updates.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on **http://localhost:8000**

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Admin Routes

#### Create a Match

```bash
curl -X POST http://localhost:8000/admin/matches \
  -H "Content-Type: application/json" \
  -d '{"teamA": "Arsenal", "teamB": "Chelsea"}'
```

Response:

```json
{
	"id": "match-1234567890-abc123",
	"teamA": "Arsenal",
	"teamB": "Chelsea",
	"score": { "a": 0, "b": 0 },
	"status": "idle"
}
```

#### Start a Match

```bash
curl -X POST http://localhost:8000/admin/matches/MATCH_ID/start
```

This starts the match simulator and begins broadcasting SSE events. The match will auto-end after 5 minutes.

#### Seed Sample Matches

```bash
curl -X POST http://localhost:8000/admin/seed
```

Creates 5 sample matches for testing.

### Public Routes

#### List All Matches

```bash
curl http://localhost:8000/matches
```

#### Get Match Details

```bash
curl http://localhost:8000/matches/MATCH_ID
```

#### Subscribe to Match Events (SSE)

```bash
curl -N --no-buffer http://localhost:8000/matches/MATCH_ID/events/stream
```

The `-N` and `--no-buffer` flags are important for SSE to work properly with curl.

## SSE Event Format

Events are sent as JSON with the following structure:

```json
{
	"type": "goal",
	"timestamp": "2025-11-26T10:30:00.000Z",
	"matchId": "match-1234567890-abc123",
	"team": "A",
	"player": "Silva",
	"score": { "a": 1, "b": 0 },
	"details": "Goal scored by Silva!"
}
```

### Event Types

-   `match_started` - Match has begun
-   `goal` - A goal was scored (includes updated score)
-   `card` - Yellow or red card issued
-   `foul` - Foul committed
-   `match_ended` - Match finished (after 5 minutes)

## Testing SSE from Browser

```javascript
const eventSource = new EventSource(
	"http://localhost:8000/matches/MATCH_ID/events/stream"
);

eventSource.onmessage = (event) => {
	const data = JSON.parse(event.data);
	console.log("Event:", data);
};

eventSource.onerror = (error) => {
	console.error("SSE Error:", error);
};

// Close when done
// eventSource.close();
```

## Architecture

-   **src/server.ts** - Express server setup
-   **src/types.ts** - TypeScript type definitions
-   **src/store.ts** - In-memory data store
-   **src/simulator.ts** - Match event simulator
-   **src/sse/broadcaster.ts** - SSE connection manager
-   **src/routes/admin.ts** - Admin endpoints (create/start matches)
-   **src/routes/matches.ts** - Public endpoints (view matches, SSE stream)

## Features

-   ✅ In-memory storage (no database required)
-   ✅ Automatic event simulation for live matches
-   ✅ Multiple concurrent matches supported
-   ✅ SSE with proper headers and client disconnect handling
-   ✅ Matches auto-end after 5 minutes
-   ✅ Historical events sent to new SSE clients
-   ✅ CORS configured for frontend on port 5173

## Notes

-   Events are simulated automatically once a match starts
-   Each match runs for exactly 5 minutes
-   Goals, cards, and fouls are randomly generated
-   All data is stored in-memory and lost on server restart
