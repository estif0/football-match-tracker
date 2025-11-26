/**
 * In-memory data store for matches
 */

import { Match, MatchEvent } from './types';

class MatchStore {
  private matches: Map<string, Match> = new Map();
  private events: Map<string, MatchEvent[]> = new Map();

  createMatch(match: Match): Match {
    this.matches.set(match.id, match);
    this.events.set(match.id, []);
    return match;
  }

  getMatch(id: string): Match | undefined {
    return this.matches.get(id);
  }

  getAllMatches(): Match[] {
    return Array.from(this.matches.values());
  }

  updateMatch(id: string, updates: Partial<Match>): Match | undefined {
    const match = this.matches.get(id);
    if (!match) return undefined;

    const updated = { ...match, ...updates };
    this.matches.set(id, updated);
    return updated;
  }

  addEvent(matchId: string, event: MatchEvent): void {
    const events = this.events.get(matchId) || [];
    events.push(event);
    this.events.set(matchId, events);
  }

  getEvents(matchId: string): MatchEvent[] {
    return this.events.get(matchId) || [];
  }

  deleteMatch(id: string): boolean {
    this.events.delete(id);
    return this.matches.delete(id);
  }

  clear(): void {
    this.matches.clear();
    this.events.clear();
  }
}

export const store = new MatchStore();
