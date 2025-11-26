/**
 * SSE Broadcaster - Manages Server-Sent Events connections and broadcasting
 */

import { Response } from 'express';
import { MatchEvent } from '../types';

interface Client {
  id: string;
  matchId: string;
  res: Response;
}

class SSEBroadcaster {
  private clients: Map<string, Client[]> = new Map();

  /**
   * Register a new SSE client for a specific match
   */
  addClient(matchId: string, res: Response): string {
    const clientId = `${matchId}-${Date.now()}-${Math.random()}`;
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial comment to establish connection
    res.write(': connected\n\n');

    const client: Client = { id: clientId, matchId, res };
    
    const matchClients = this.clients.get(matchId) || [];
    matchClients.push(client);
    this.clients.set(matchId, matchClients);

    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(matchId, clientId);
    });

    return clientId;
  }

  /**
   * Remove a client from the broadcaster
   */
  private removeClient(matchId: string, clientId: string): void {
    const matchClients = this.clients.get(matchId);
    if (!matchClients) return;

    const filtered = matchClients.filter(c => c.id !== clientId);
    
    if (filtered.length === 0) {
      this.clients.delete(matchId);
    } else {
      this.clients.set(matchId, filtered);
    }
  }

  /**
   * Broadcast an event to all clients watching a specific match
   */
  broadcast(matchId: string, event: MatchEvent): void {
    const matchClients = this.clients.get(matchId);
    if (!matchClients || matchClients.length === 0) return;

    const data = JSON.stringify(event);
    const message = `data: ${data}\n\n`;

    // Send to all connected clients for this match
    matchClients.forEach(client => {
      try {
        client.res.write(message);
      } catch (error) {
        console.error(`Error sending to client ${client.id}:`, error);
        this.removeClient(matchId, client.id);
      }
    });
  }

  /**
   * Get count of connected clients for a match
   */
  getClientCount(matchId: string): number {
    return this.clients.get(matchId)?.length || 0;
  }

  /**
   * Close all connections for a match
   */
  closeMatch(matchId: string): void {
    const matchClients = this.clients.get(matchId);
    if (!matchClients) return;

    matchClients.forEach(client => {
      try {
        client.res.end();
      } catch (error) {
        console.error(`Error closing client ${client.id}:`, error);
      }
    });

    this.clients.delete(matchId);
  }
}

export const broadcaster = new SSEBroadcaster();
