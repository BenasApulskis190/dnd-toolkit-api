import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../lib/swagger';
import monsterRoutes from './routes/monster.routes';
import monsterTypeRoutes from './routes/monterType.routes';
import searchRoutes from './routes/search.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Static image assets
app.use('/api/images', express.static(path.join(__dirname, '../../database/data/img')));

// API routes
app.use('/api/monsters', monsterRoutes);
app.use('/api/monster-types', monsterTypeRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/hello', (_, res) => {
  res.json({ text: 'Hello from D&D API!' });
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (_, res) => {
  res.json({
    name: 'D&D Toolkit API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      monsters: {
        list: 'GET /api/monsters?page=1&limit=20',
        byId: 'GET /api/monsters/:id',
        search: 'GET /api/monsters/search?q=dragon',
        filter: 'GET /api/monsters/filter?type=dragon&crMin=5',
        stats: 'GET /api/monsters/stats',
      },
      search: {
        all: 'GET /api/search?q=fire',
        indices: 'GET /api/search/indices',
        index: 'GET /api/search/:index?q=fire',
      },
    },
  });
});

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(null, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'D&D Toolkit API Docs',
  swaggerOptions: {
    spec: swaggerSpec,
    url: '/swagger.json',
    persistAuthorization: true,
  },
}));

// Serve swagger spec as JSON
app.get('/swagger.json', (_, res) => {
  res.json(swaggerSpec);
});

app.listen(PORT, () => {
  console.log(`D&D Toolkit API running on port ${PORT}`);
  console.log('Documentation: http://localhost:' + PORT + '/api/docs');
  console.log('Available endpoints:');
  console.log('  GET /api/monsters        - List all monsters (paginated)');
  console.log('  GET /api/monsters/search - Search monsters (Elasticsearch)');
  console.log('  GET /api/monsters/filter - Filter monsters');
  console.log('  GET /api/monsters/stats  - Monster statistics');
  console.log('  GET /api/monsters/:id    - Get monster by ID');
  console.log('  GET /api/search          - Search all content');
  console.log('  GET /api/search/indices  - List available indices');
  console.log('  GET /api/search/:index   - Search specific index');
  console.log('  GET /api/health          - Health check');
  console.log('  GET /api/docs           - Swagger UI');
});
