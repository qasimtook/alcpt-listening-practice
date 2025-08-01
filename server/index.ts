import express from 'express';
import cors from 'cors';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import routes from './routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../audio_storage')));

// API routes
app.use('/api', routes);

// Development vs Production setup
if (process.env.NODE_ENV === 'development') {
  // Development: Use Vite dev server
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  app.use(vite.ssrFixStacktrace);
  app.use('*', vite.middlewares);
} else {
  // Production: Serve built files
  app.use(express.static(join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
