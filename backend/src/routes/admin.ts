/**
 * Admin routes for managing matches
 */

import { Router } from 'express';
import { store } from '../store';
import { simulator } from '../simulator';
import { Match, CreateMatchRequest } from '../types';

export const adminRouter: Router = Router();

/**
 * POST /admin/matches
 * Create a new match
 */
adminRouter.post('/matches', (req, res) => {
  const { teamA, teamB } = req.body as CreateMatchRequest;

  if (!teamA || !teamB) {
    return res.status(400).json({ error: 'teamA and teamB are required' });
  }

  const match: Match = {
    id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    teamA,
    teamB,
    score: { a: 0, b: 0 },
    status: 'idle'
  };

  const created = store.createMatch(match);
  console.log(`Created match: ${created.id} - ${teamA} vs ${teamB}`);
  
  res.status(201).json(created);
});

/**
 * POST /admin/matches/:id/start
 * Start a match (begins simulation and SSE broadcasting)
 */
adminRouter.post('/matches/:id/start', (req, res) => {
  const { id } = req.params;
  const match = store.getMatch(id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  if (match.status === 'live') {
    return res.status(400).json({ error: 'Match is already live' });
  }

  if (match.status === 'ended') {
    return res.status(400).json({ error: 'Match has already ended' });
  }

  const started = simulator.startMatch(id);
  
  if (!started) {
    return res.status(500).json({ error: 'Failed to start match' });
  }

  const updated = store.getMatch(id);
  console.log(`Started match: ${id}`);
  
  res.json(updated);
});

/**
 * POST /admin/seed
 * Create sample matches for testing
 */
adminRouter.post('/seed', (req, res) => {
  const sampleMatches: CreateMatchRequest[] = [
    { teamA: 'Manchester United', teamB: 'Liverpool' },
    { teamA: 'Real Madrid', teamB: 'Barcelona' },
    { teamA: 'Bayern Munich', teamB: 'Borussia Dortmund' },
    { teamA: 'PSG', teamB: 'Marseille' },
    { teamA: 'Juventus', teamB: 'AC Milan' }
  ];

  const created: Match[] = [];

  for (const sample of sampleMatches) {
    const match: Match = {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamA: sample.teamA,
      teamB: sample.teamB,
      score: { a: 0, b: 0 },
      status: 'idle'
    };
    created.push(store.createMatch(match));
  }

  console.log(`Seeded ${created.length} sample matches`);
  res.status(201).json(created);
});
