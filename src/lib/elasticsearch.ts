import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const esClient = new Client({
  node: ELASTICSEARCH_URL,
});

export const INDICES = {
  races: 'races',
  classes: 'classes',
  spells: 'spells',
  monsters: 'monsters',
  items: 'items',
  backgrounds: 'backgrounds',
  feats: 'feats',
  conditions: 'conditions',
} as const;

export type IndexName = typeof INDICES[keyof typeof INDICES];

export async function indexDocument<T extends { id: string }>(
  index: IndexName,
  document: T
): Promise<void> {
  await esClient.index({
    index,
    id: document.id,
    document,
    refresh: true,
  });
}

export async function bulkIndex<T extends { id: string }>(
  index: IndexName,
  documents: T[]
): Promise<void> {
  if (documents.length === 0) return;

  const operations = documents.flatMap((doc) => [
    { index: { _index: index, _id: doc.id } },
    doc,
  ]);

  const result = await esClient.bulk({ operations, refresh: true });
  
  if (result.errors) {
    const errorItems = result.items.filter((item) => item.index?.error);
    console.error(`Bulk indexing errors:`, errorItems);
  }
}

export async function search<T>(
  index: IndexName,
  query: string,
  options?: {
    size?: number;
    from?: number;
    filters?: Record<string, any>;
  }
): Promise<{ hits: T[]; total: number }> {
  const { size = 20, from = 0, filters } = options || {};

  const must: any[] = [];
  
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'description', 'type', 'source'],
        fuzziness: 'AUTO',
      },
    });
  }

  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        must.push({ term: { [field]: value } });
      }
    }
  }

  const searchParams: any = {
    index,
    size,
    from,
    _source: true,
  };

  if (must.length > 0) {
    searchParams.query = { bool: { must } };
  } else {
    searchParams.query = { match_all: {} };
  }

  const result = await esClient.search<T>(searchParams);

  return {
    hits: result.hits.hits.map((hit) => hit._source as T),
    total: typeof result.hits.total === 'number' 
      ? result.hits.total 
      : result.hits.total?.value || 0,
  };
}

export async function deleteIndex(index: IndexName): Promise<void> {
  try {
    await esClient.indices.delete({ index });
  } catch (error: any) {
    if (error.meta?.statusCode !== 404) {
      throw error;
    }
  }
}

export async function recreateIndex(
  index: IndexName,
  settings?: any
): Promise<void> {
  await deleteIndex(index);
  await esClient.create({ index, ...settings });
}

export async function getDocumentCount(index: IndexName): Promise<number> {
  try {
    const result = await esClient.count({ index });

    return result.count;
  } catch (error) {

    return 0;
  }
}
