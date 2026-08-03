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
      { name: 'Spells', description: 'Spell management endpoints' },
      { name: 'Conditions', description: 'Condition management endpoints' },
      { name: 'Backgrounds', description: 'Background management endpoints' },
      { name: 'Feats', description: 'Feat management endpoints' },
      { name: 'Classes', description: 'Class management endpoints' },
      { name: 'Items', description: 'Item management endpoints' },
      { name: 'Races', description: 'Race management endpoints' },
      { name: 'Adventures', description: 'Published adventure content endpoints' },
      { name: 'NPCs', description: 'Adventure NPC endpoints' },
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
        Spell: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            level: { type: 'integer', description: 'Spell level (0 = cantrip)' },
            school: { type: 'string', nullable: true },
            castingTime: { type: 'object' },
            range: { type: 'object' },
            components: { type: 'object' },
            materialDescription: { type: 'string', nullable: true },
            duration: { type: 'object' },
            concentration: { type: 'boolean' },
            ritual: { type: 'boolean' },
            description: { type: 'object' },
            higherLevel: { type: 'object', nullable: true },
            damageType: { type: 'string', nullable: true },
            savingThrow: { type: 'string', nullable: true },
            page: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Condition: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            description: { type: 'object' },
            page: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Background: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            skillProficiencies: { type: 'object', nullable: true },
            toolProficiencies: { type: 'object', nullable: true },
            languages: { type: 'object', nullable: true },
            startingGold: { type: 'integer', nullable: true },
            featureName: { type: 'string', nullable: true },
            featureDescription: { type: 'object', nullable: true },
            suggestedTraits: { type: 'object', nullable: true },
            suggestedIdeals: { type: 'object', nullable: true },
            suggestedBonds: { type: 'object', nullable: true },
            suggestedFlaws: { type: 'object', nullable: true },
            page: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Feat: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            prerequisite: { type: 'object', nullable: true },
            abilityBonuses: { type: 'object', nullable: true },
            description: { type: 'object' },
            page: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ClassFeature: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            level: { type: 'integer' },
            description: { type: 'object' },
            gainSubclassFeature: { type: 'boolean' },
          },
        },
        Subclass: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            shortName: { type: 'string', nullable: true },
            source: { type: 'string' },
            description: { type: 'object', nullable: true },
            features: {
              type: 'array',
              items: { $ref: '#/components/schemas/ClassFeature' },
            },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            hitDie: { type: 'integer', description: 'Hit die value (e.g. 6, 8, 10, 12)' },
            subclassTitle: { type: 'string', nullable: true },
            description: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            type: { type: 'string', description: 'Item type (e.g. weapon, armor, wondrous item)' },
            subtype: { type: 'string', nullable: true },
            rarity: { type: 'string', nullable: true, enum: ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'] },
            attunement: { type: 'boolean' },
            value: { type: 'string', nullable: true },
            weight: { type: 'number', nullable: true },
            damage: { type: 'string', nullable: true },
            damageType: { type: 'string', nullable: true },
            armorClass: { type: 'integer', nullable: true },
            strengthRequirement: { type: 'integer', nullable: true },
            stealthDisadvantage: { type: 'boolean' },
            description: { type: 'object', nullable: true },
            page: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Subrace: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            raceId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string', nullable: true },
            page: { type: 'integer', nullable: true },
            abilityBonuses: { type: 'object', nullable: true },
            description: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Race: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            source: { type: 'string' },
            page: { type: 'integer', nullable: true },
            size: { type: 'string', nullable: true, enum: ['S', 'M', 'L', 'H', 'G'] },
            speed: { type: 'integer' },
            darkvision: { type: 'integer', nullable: true },
            speedFly: { type: 'integer', nullable: true },
            speedSwim: { type: 'integer', nullable: true },
            strBonus: { type: 'integer', nullable: true },
            dexBonus: { type: 'integer', nullable: true },
            conBonus: { type: 'integer', nullable: true },
            intBonus: { type: 'integer', nullable: true },
            wisBonus: { type: 'integer', nullable: true },
            chaBonus: { type: 'integer', nullable: true },
            description: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            subraces: { type: 'array', items: { $ref: '#/components/schemas/Subrace' } },
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
      '/api/spells': {
        get: {
          tags: ['Spells'],
          summary: 'List all spells',
          description: 'Get all spells ordered alphabetically by name.',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Spell' },
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
      '/api/spells/{id}': {
        get: {
          tags: ['Spells'],
          summary: 'Get spell by ID',
          description: 'Get a single spell by its UUID.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Spell UUID',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Spell' },
                },
              },
            },
            '404': {
              description: 'Spell not found',
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
      '/api/conditions': {
        get: {
          tags: ['Conditions'],
          summary: 'List and search conditions',
          description: 'Get a paginated list of conditions. With `q`, uses Elasticsearch. Without `q`, uses Prisma with optional `source` filter.',
          parameters: [
            { name: 'q', in: 'query', description: 'Full-text search query', schema: { type: 'string' } },
            { name: 'source', in: 'query', description: 'Filter by source book (e.g. PHB)', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page number (default: 1)', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page (default: 20)', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Paginated list of conditions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Condition' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/conditions/{id}': {
        get: {
          tags: ['Conditions'],
          summary: 'Get condition by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Condition UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': { description: 'Condition found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Condition' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/backgrounds': {
        get: {
          tags: ['Backgrounds'],
          summary: 'List and search backgrounds',
          description: 'Get a paginated list of backgrounds. With `q`, uses Elasticsearch. Without `q`, uses Prisma with optional `source` filter.',
          parameters: [
            { name: 'q', in: 'query', description: 'Full-text search query', schema: { type: 'string' } },
            { name: 'source', in: 'query', description: 'Filter by source book (e.g. PHB)', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page number (default: 1)', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page (default: 20)', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Paginated list of backgrounds',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Background' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/backgrounds/{id}': {
        get: {
          tags: ['Backgrounds'],
          summary: 'Get background by ID',
          description: 'Returns the background with its associated languages.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Background UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': { description: 'Background found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Background' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/feats': {
        get: {
          tags: ['Feats'],
          summary: 'List and search feats',
          description: 'Get a paginated list of feats. With `q`, uses Elasticsearch. Without `q`, uses Prisma with optional `source` filter.',
          parameters: [
            { name: 'q', in: 'query', description: 'Full-text search query', schema: { type: 'string' } },
            { name: 'source', in: 'query', description: 'Filter by source book (e.g. PHB)', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page number (default: 1)', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page (default: 20)', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Paginated list of feats',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Feat' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/feats/{id}': {
        get: {
          tags: ['Feats'],
          summary: 'Get feat by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Feat UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': { description: 'Feat found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Feat' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/classes': {
        get: {
          tags: ['Classes'],
          summary: 'List and search classes',
          description: 'Get a paginated list of classes. With `q`, uses Elasticsearch. Without `q`, uses Prisma with optional filters.',
          parameters: [
            { name: 'q', in: 'query', description: 'Full-text search query', schema: { type: 'string' } },
            { name: 'source', in: 'query', description: 'Filter by source book (e.g. PHB)', schema: { type: 'string' } },
            { name: 'hitDie', in: 'query', description: 'Filter by hit die value (e.g. 6, 8, 10, 12)', schema: { type: 'integer' } },
            { name: 'page', in: 'query', description: 'Page number (default: 1)', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page (default: 20)', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Paginated list of classes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Class' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/classes/{id}': {
        get: {
          tags: ['Classes'],
          summary: 'Get class by ID',
          description: 'Returns the class with its features and subclasses (including subclass features).',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Class UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'Class found',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Class' },
                      {
                        type: 'object',
                        properties: {
                          features: { type: 'array', items: { $ref: '#/components/schemas/ClassFeature' } },
                          subclasses: { type: 'array', items: { $ref: '#/components/schemas/Subclass' } },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/items': {
        get: {
          tags: ['Items'],
          summary: 'List and search items',
          description: 'Get a paginated list of items. With `q`, uses Elasticsearch. Without `q`, uses Prisma with optional filters.',
          parameters: [
            { name: 'q', in: 'query', description: 'Full-text search query', schema: { type: 'string' } },
            { name: 'type', in: 'query', description: 'Filter by item type (e.g. weapon, armor)', schema: { type: 'string' } },
            { name: 'subtype', in: 'query', description: 'Filter by item subtype (e.g. shortsword, chain mail)', schema: { type: 'string' } },
            { name: 'rarity', in: 'query', description: 'Filter by rarity', schema: { type: 'string', enum: ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'] } },
            { name: 'attunement', in: 'query', description: 'Filter by attunement requirement', schema: { type: 'boolean' } },
            { name: 'source', in: 'query', description: 'Filter by source book', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page number (default: 1)', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page (default: 20)', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Paginated list of items',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Item' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/items/{id}': {
        get: {
          tags: ['Items'],
          summary: 'Get item by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Item UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': { description: 'Item found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Item' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/races': {
        get: {
          tags: ['Races'],
          summary: 'List and search races',
          description: 'Get a paginated list of races with their subraces. With `q`, uses Elasticsearch. Without `q`, uses Prisma with optional filters.',
          parameters: [
            { name: 'q', in: 'query', description: 'Full-text search query', schema: { type: 'string' } },
            { name: 'source', in: 'query', description: 'Filter by source book (e.g. PHB)', schema: { type: 'string' } },
            { name: 'size', in: 'query', description: 'Filter by size (S, M, L, H, G)', schema: { type: 'string' } },
            { name: 'page', in: 'query', description: 'Page number (default: 1)', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Items per page (default: 20)', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Paginated list of races',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Race' } },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/races/{id}': {
        get: {
          tags: ['Races'],
          summary: 'Get race by ID',
          description: 'Returns the race with its subraces and language names.',
          parameters: [
            { name: 'id', in: 'path', required: true, description: 'Race UUID', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'Race found',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Race' },
                      {
                        type: 'object',
                        properties: {
                          languages: { type: 'array', items: { type: 'string' } },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
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
