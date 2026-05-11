import { Request, Response } from 'express';
import { esClient, INDICES } from '../../lib/elasticsearch';

const ALL_INDICES = Object.values(INDICES);

export async function searchAllContent(req: Request, res: Response) {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const allHits: any[] = [];

    for (const index of ALL_INDICES) {
      try {
        const result = await esClient.search({
          index,
          query: {
            multi_match: {
              query,
              fields: ['name^5', 'description^2', 'type', 'source'],
              fuzziness: 'AUTO',
            },
          },
          size: limit,
          from: offset,
        });

        for (const hit of result.hits.hits) {
          allHits.push({
            ...hit._source,
            _index: index,
            _score: hit._score,
          });
        }
      } catch (error) {
        console.error(`Error searching ${index}:`, error);
      }
    }

    allHits.sort((a, b) => (b._score || 0) - (a._score || 0));
    const hits = allHits.slice(0, limit);

    res.json({
      query,
      data: hits,
      pagination: {
        limit,
        offset,
        total: hits.length,
      },
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
}

export async function searchIndex(req: Request, res: Response) {
  try {
    const { index } = req.params;
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!ALL_INDICES.includes(index as any)) {
      return res.status(400).json({ 
        error: 'Invalid index',
        validIndices: ALL_INDICES 
      });


    }

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const result = await esClient.search({
      index,
      query: {
        multi_match: {
          query,
          fields: ['name^3', 'description', 'type', 'source'],
          fuzziness: 'AUTO',
        },
      },
      size: limit,
      from: offset,
    });

    const hits = result.hits.hits.map((hit: any) => hit._source);

    res.json({
      index,
      query,
      data: hits,
      pagination: {
        limit,
        offset,
        total: result.hits.total?.value || hits.length,
      },
    });
  } catch (error) {
    console.error('Error searching index:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
}

export async function getAvailableIndices(req: Request, res: Response) {
  res.json({
    indices: ALL_INDICES.map(name => ({
      name,
      description: getIndexDescription(name),
    })),
  });
}

function getIndexDescription(index: string): string {
  const descriptions: Record<string, string> = {
    races: 'Character races and subraces',
    classes: 'Character classes and subclasses',
    spells: 'Magic spells from all sources',
    monsters: 'Creatures, beasts, and enemies',
    items: 'Weapons, armor, and equipment',
    backgrounds: 'Character backgrounds',
    feats: 'Feats and ability improvements',
    conditions: 'Status conditions and effects',
  };
  return descriptions[index] || 'D&D 5e content';
}
