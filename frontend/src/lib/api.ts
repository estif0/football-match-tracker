/**
 * API client for backend communication
 */

import { Match, MatchEvent } from '../types';

const API_BASE = 'http://localhost:8000';

export const api = {
  /**
   * Fetch all matches
   */
  async getMatches(): Promise<Match[]> {
    const response = await fetch(`${API_BASE}/matches`);
    if (!response.ok) throw new Error('Failed to fetch matches');
    return response.json();
  },

  /**
   * Fetch a single match by ID
   */
  async getMatch(id: string): Promise<Match> {
    const response = await fetch(`${API_BASE}/matches/${id}`);
    if (!response.ok) throw new Error('Failed to fetch match');
    return response.json();
  },

  /**
   * Subscribe to match events via SSE
   * Returns an EventSource instance
   */
  subscribeToMatch(matchId: string, onEvent: (event: MatchEvent) => void): EventSource {
    const eventSource = new EventSource(`${API_BASE}/matches/${matchId}/events/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MatchEvent;
        onEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return eventSource;
  },

  /**
   * Admin: Create a new match
   */
  async createMatch(teamA: string, teamB: string): Promise<Match> {
    const response = await fetch(`${API_BASE}/admin/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamA, teamB }),
    });
    if (!response.ok) throw new Error('Failed to create match');
    return response.json();
  },

  /**
   * Admin: Start a match
   */
  async startMatch(id: string): Promise<Match> {
    const response = await fetch(`${API_BASE}/admin/matches/${id}/start`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to start match');
    return response.json();
  },

  /**
   * Admin: Seed sample matches
   */
  async seedMatches(): Promise<Match[]> {
    const response = await fetch(`${API_BASE}/admin/seed`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to seed matches');
    return response.json();
  },
};
