/**
 * Main server entry point
 */

import express from 'express';
import cors from 'cors';
import { adminRouter } from './routes/admin';
import { matchesRouter } from './routes/matches';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/admin', adminRouter);
app.use('/matches', matchesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚽ Football Match Tracker Backend`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend expected at http://localhost:5173`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /admin/matches - Create match`);
  console.log(`  POST /admin/matches/:id/start - Start match`);
  console.log(`  POST /admin/seed - Seed sample matches`);
  console.log(`  GET  /matches - List all matches`);
  console.log(`  GET  /matches/:id - Get match details`);
  console.log(`  GET  /matches/:id/events/stream - SSE stream`);
});
