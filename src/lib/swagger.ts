import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'D&D Toolkit API',
      version: '1.0.0',
      description: 'API for D&D 5e content management - races, classes, spells, monsters, items, and more.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'http://api.dev',
        description: 'Docker development',
      },
    ],
    tags: [
      { name: 'Monsters', description: 'Monster management endpoints' },
      { name: 'Monster Types', description: 'Monster type management endpoints' },
      { name: 'Search', description: 'Unified search across all content' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
    components: {
      schemas: {
        Monster: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string', description: 'Source book code (e.g., PHB, MM)' },
            size: { type: 'string', enum: ['T', 'S', 'M', 'L', 'H', 'G'] },
            type: { type: 'string' },
            tags: { type: 'string', nullable: true },
            alignment: { type: 'string', nullable: true },
            armorClass: { type: 'integer' },
            armorType: { type: 'string', nullable: true },
            hitPointsAvg: { type: 'integer' },
            hitPointsFormula: { type: 'string' },
            speedWalk: { type: 'integer' },
            speedFly: { type: 'integer', nullable: true },
            speedSwim: { type: 'integer', nullable: true },
            speedClimb: { type: 'integer', nullable: true },
            strScore: { type: 'integer' },
            dexScore: { type: 'integer' },
            conScore: { type: 'integer' },
            intScore: { type: 'integer' },
            wisScore: { type: 'integer' },
            chaScore: { type: 'integer' },
            challengeRating: { type: 'string' },
            crValue: { type: 'number' },
            languages: { type: 'string', nullable: true },
            page: { type: 'integer', nullable: true },
          },
        },
        MonsterTrait: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            monsterId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        MonsterAction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            monsterId: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Monster' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        MonsterType: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/monsters': {
        get: {
          tags: ['Monsters'],
          summary: 'List, search, and filter monsters',
          description: 'Get a paginated list of monsters. With `q`, uses Elasticsearch for full-text search. Without `q`, uses Prisma — optionally filtered by `type`.',
          parameters: [
            {
              name: 'q',
              in: 'query',
              description: 'Full-text search query (enables Elasticsearch)',
              schema: { type: 'string' },
            },
            {
              name: 'type',
              in: 'query',
              description: 'Filter by monster type name (e.g., Dragon, Undead). Works with or without `q`.',
              schema: { type: 'string' },
            },
            {
              name: 'crMin',
              in: 'query',
              description: 'Minimum challenge rating value',
              schema: { type: 'number' },
            },
            {
              name: 'crMax',
              in: 'query',
              description: 'Maximum challenge rating value',
              schema: { type: 'number' },
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number (default: 1)',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Items per page (default: 20)',
              schema: { type: 'integer', default: 20 },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/monsters/{id}': {
        get: {
          tags: ['Monsters'],
          summary: 'Get monster by ID',
          description: 'Get a single monster by its ID, including traits and actions.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Monster UUID',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                      source: { type: 'string' },
                      size: { type: 'string' },
                      monsterType: { type: 'string', description: 'Monster type (note: "type" is reserved' },
                      traits: { 
                        type: 'array',
                        items: { $ref: '#/components/schemas/MonsterTrait' }
                      },
                      actions: { 
                        type: 'array',
                        items: { $ref: '#/components/schemas/MonsterAction' }
                      },
                    },
                    required: ['id', 'name'],
                  },
                },
              },
            },
            '404': {
              description: 'Monster not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },

      '/api/monsters/stats': {
        get: {
          tags: ['Monsters'],
          summary: 'Get monster statistics',
          description: 'Get statistics about monsters including type and challenge rating distribution.',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      byType: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            type: { type: 'string' },
                            count: { type: 'integer' },
                          },
                        },
                      },
                      byCR: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            cr: { type: 'string' },
                            count: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/monster-types': {
        get: {
          tags: ['Monster Types'],
          summary: 'List all monster types',
          description: 'Get all monster types ordered by name.',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MonsterType' },
                  },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/monster-types/{id}': {
        get: {
          tags: ['Monster Types'],
          summary: 'Get monster type by ID',
          description: 'Get a single monster type by its ID, including its monsters.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Monster type UUID',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/MonsterType' },
                      {
                        type: 'object',
                        properties: {
                          monsters: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Monster' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Monster type not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Check if the API is running.',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/search': {
        get: {
          tags: ['Search'],
          summary: 'Search all content',
          description: 'Search across all D&D content (races, classes, spells, monsters, items, etc.) using Elasticsearch.',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              description: 'Search query',
              schema: { type: 'string' },
            },
            {
              name: 'types',
              in: 'query',
              description: 'Comma-separated list of indices to search (races, classes, spells, monsters, items, backgrounds, feats, conditions)',
              schema: { type: 'string' },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Results per index (default: 20)',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Offset for pagination (default: 0)',
              schema: { type: 'integer', default: 0 },
            },
          ],
          responses: {
            '200': {
              description: 'Search results grouped by content type',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      query: { type: 'string' },
                      indices: { type: 'array', items: { type: 'string' } },
                      data: { 
                        type: 'object',
                        additionalProperties: { type: 'array' },
                        description: 'Results keyed by index name'
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          limit: { type: 'integer' },
                          offset: { type: 'integer' },
                          total: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Missing required query parameter',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { error: { type: 'string' } } },
                },
              },
            },
          },
        },
      },
      '/api/search/indices': {
        get: {
          tags: ['Search'],
          summary: 'List available search indices',
          description: 'Get list of all indices available for searching.',
          responses: {
            '200': {
              description: 'List of available indices',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      indices: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
