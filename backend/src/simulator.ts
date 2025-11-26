/**
 * Match Simulator - Generates realistic match events automatically
 */

import { Match, MatchEvent, Team } from './types';
import { store } from './store';
import { broadcaster } from './sse/broadcaster';

const MATCH_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MIN_EVENT_INTERVAL_MS = 5000; // 5 seconds
const MAX_EVENT_INTERVAL_MS = 30000; // 30 seconds

const PLAYER_NAMES = [
  'Abebe', 'Tesfaye', 'Kebede', 'Girma', 'Tadesse',
  'Bekele', 'Lemma', 'Haile', 'Wolde', 'Mulugeta',
  'Desta', 'Gebre', 'Yohannes', 'Mengistu', 'Getachew'
];

const CARD_TYPES = ['Yellow Card', 'Red Card'];
const FOUL_TYPES = ['Hard tackle', 'Hand ball', 'Offside', 'Dangerous play'];

class MatchSimulator {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start simulating a match
   */
  startMatch(matchId: string): boolean {
    const match = store.getMatch(matchId);
    if (!match || match.status !== 'idle') {
      return false;
    }

    // Update match status
    store.updateMatch(matchId, {
      status: 'live',
      startedAt: new Date().toISOString()
    });

    // Emit match started event
    this.emitEvent(matchId, {
      type: 'match_started',
      timestamp: new Date().toISOString(),
      matchId,
    });

    // Schedule random events
    this.scheduleEvents(matchId);

    // Schedule match end
    const endTimer = setTimeout(() => {
      this.endMatch(matchId);
    }, MATCH_DURATION_MS);

    this.timers.set(`${matchId}-end`, endTimer);

    return true;
  }

  /**
   * Schedule random match events
   */
  private scheduleEvents(matchId: string): void {
    const match = store.getMatch(matchId);
    if (!match || match.status !== 'live') return;

    const delay = this.randomInterval(MIN_EVENT_INTERVAL_MS, MAX_EVENT_INTERVAL_MS);
    
    const timer = setTimeout(() => {
      const match = store.getMatch(matchId);
      if (!match || match.status !== 'live') return;

      // Generate random event
      this.generateRandomEvent(matchId);

      // Schedule next event
      this.scheduleEvents(matchId);
    }, delay);

    this.timers.set(`${matchId}-event-${Date.now()}`, timer);
  }

  /**
   * Generate a random match event
   */
  private generateRandomEvent(matchId: string): void {
    const match = store.getMatch(matchId);
    if (!match) return;

    const eventType = this.selectEventType();
    const team = this.randomTeam();
    const player = this.randomPlayer();

    switch (eventType) {
      case 'goal':
        this.handleGoal(matchId, team, player);
        break;
      case 'card':
        this.handleCard(matchId, team, player);
        break;
      case 'foul':
        this.handleFoul(matchId, team, player);
        break;
    }
  }

  /**
   * Handle a goal event
   */
  private handleGoal(matchId: string, team: Team, player: string): void {
    const match = store.getMatch(matchId);
    if (!match) return;

    // Update score
    const newScore = { ...match.score };
    if (team === 'A') {
      newScore.a++;
    } else {
      newScore.b++;
    }

    store.updateMatch(matchId, { score: newScore });

    // Emit goal event
    this.emitEvent(matchId, {
      type: 'goal',
      timestamp: new Date().toISOString(),
      matchId,
      team,
      player,
      score: newScore,
      details: `Goal scored by ${player}!`
    });
  }

  /**
   * Handle a card event
   */
  private handleCard(matchId: string, team: Team, player: string): void {
    const cardType = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
    
    this.emitEvent(matchId, {
      type: 'card',
      timestamp: new Date().toISOString(),
      matchId,
      team,
      player,
      details: `${cardType} for ${player}`
    });
  }

  /**
   * Handle a foul event
   */
  private handleFoul(matchId: string, team: Team, player: string): void {
    const foulType = FOUL_TYPES[Math.floor(Math.random() * FOUL_TYPES.length)];
    
    this.emitEvent(matchId, {
      type: 'foul',
      timestamp: new Date().toISOString(),
      matchId,
      team,
      player,
      details: `${foulType} by ${player}`
    });
  }

  /**
   * End a match
   */
  private endMatch(matchId: string): void {
    const match = store.getMatch(matchId);
    if (!match || match.status === 'ended') return;

    // Update match status
    store.updateMatch(matchId, {
      status: 'ended',
      endedAt: new Date().toISOString()
    });

    // Emit match ended event
    this.emitEvent(matchId, {
      type: 'match_ended',
      timestamp: new Date().toISOString(),
      matchId,
      score: match.score,
      details: 'Match finished'
    });

    // Clear all timers for this match
    this.clearMatchTimers(matchId);
  }

  /**
   * Clear all timers associated with a match
   */
  private clearMatchTimers(matchId: string): void {
    for (const [key, timer] of this.timers.entries()) {
      if (key.startsWith(matchId)) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
    }
  }

  /**
   * Emit an event and broadcast it via SSE
   */
  private emitEvent(matchId: string, event: MatchEvent): void {
    store.addEvent(matchId, event);
    broadcaster.broadcast(matchId, event);
    console.log(`[${matchId}] ${event.type}: ${event.details || ''}`);
  }

  /**
   * Select a random event type with weighted probabilities
   */
  private selectEventType(): 'goal' | 'card' | 'foul' {
    const rand = Math.random();
    if (rand < 0.4) return 'goal';      // 40% chance
    if (rand < 0.7) return 'foul';      // 30% chance
    return 'card';                       // 30% chance
  }

  private randomTeam(): Team {
    return Math.random() < 0.5 ? 'A' : 'B';
  }

  private randomPlayer(): string {
    return PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
  }

  private randomInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Stop a match simulation
   */
  stopMatch(matchId: string): void {
    this.clearMatchTimers(matchId);
  }
}

export const simulator = new MatchSimulator();
