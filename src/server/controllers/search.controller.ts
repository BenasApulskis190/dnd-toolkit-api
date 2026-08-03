import { Request, Response } from 'express';
import { esClient, search, INDICES, SEARCH_FIELDS, IndexName } from '../../lib/elasticsearch';
import { parsePagination, paginatedResponse } from '../../lib/pagination';

const ALL_INDICES = Object.values(INDICES);

export async function searchAllContent(req: Request, res: Response) {
  try {
    const query = (req.query.q as string) || '';
    const pagination = parsePagination(req.query);

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const result = await esClient.search({
      index: ALL_INDICES,
      query: {
        multi_match: {
          query,
          fields: SEARCH_FIELDS,
          fuzziness: 'AUTO',
        },
      },
      size: pagination.limit,
      from: pagination.from,
    });

    const hits = result.hits.hits.map((hit) => ({
      ...(hit._source as object),
      _index: hit._index,
      _score: hit._score,
    }));
    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value || 0;

    return res.json({ query, ...paginatedResponse(hits, total, pagination) });
  } catch (error) {
    console.error('Error searching:', error);
    return res.status(500).json({ error: 'Failed to search' });
  }
}

export async function searchIndex(req: Request, res: Response) {
  try {
    const { index } = req.params;
    const query = (req.query.q as string) || '';
    const pagination = parsePagination(req.query);

    if (!ALL_INDICES.includes(index as IndexName)) {
      return res.status(400).json({
        error: 'Invalid index',
        validIndices: ALL_INDICES,
      });
    }

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const { hits, total } = await search(index as IndexName, query, {
      size: pagination.limit,
      from: pagination.from,
    });

    return res.json({ index, query, ...paginatedResponse(hits, total, pagination) });
  } catch (error) {
    console.error('Error searching index:', error);
    return res.status(500).json({ error: 'Failed to search' });
  }
}

export async function getAvailableIndices(_req: Request, res: Response) {
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
