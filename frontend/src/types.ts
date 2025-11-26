/**
 * Frontend types matching backend API
 */

export type MatchStatus = 'idle' | 'live' | 'ended';

export type Team = 'A' | 'B';

export interface Score {
  a: number;
  b: number;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  score: Score;
  status: MatchStatus;
  startedAt?: string;
  endedAt?: string;
}

export type EventType = 'match_started' | 'goal' | 'card' | 'foul' | 'match_ended';

export interface MatchEvent {
  type: EventType;
  timestamp: string;
  matchId: string;
  team?: Team;
  player?: string;
  score?: Score;
  details?: string;
}
