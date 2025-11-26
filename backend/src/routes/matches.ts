/**
 * Public match routes for viewing matches and subscribing to SSE
 */

import { Router } from 'express';
import { store } from '../store';
import { broadcaster } from '../sse/broadcaster';

export const matchesRouter: Router = Router();

/**
 * GET /matches
 * Get all matches
 */
matchesRouter.get('/', (req, res) => {
  const matches = store.getAllMatches();
  res.json(matches);
});

/**
 * GET /matches/:id
 * Get a specific match by ID
 */
matchesRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const match = store.getMatch(id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  res.json(match);
});

/**
 * GET /matches/:id/events/stream
 * Subscribe to SSE stream for match events
 */
matchesRouter.get('/:id/events/stream', (req, res) => {
  const { id } = req.params;
  const match = store.getMatch(id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  // Register client for SSE updates
  const clientId = broadcaster.addClient(id, res);
  console.log(`Client ${clientId} connected to match ${id} SSE stream`);

  // Send historical events if match is live or ended
  if (match.status !== 'idle') {
    const events = store.getEvents(id);
    events.forEach(event => {
      const data = JSON.stringify(event);
      res.write(`data: ${data}\n\n`);
    });
  }
});
