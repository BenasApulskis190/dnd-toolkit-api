// Fetches NPC lore from the Forgotten Realms wiki (forgottenrealms.fandom.com)
// and caches it in database/data/npc-wiki-cache.json. The seed uses the cache
// to fill appearance/location/description gaps, so reseeding never re-fetches.
//
// A page is only accepted if its wikitext cites the NPC's own adventure book —
// this stops same-name collisions with unrelated Realms characters.
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import prisma from '../src/lib/prisma';
import { DATA_DIR } from '../src/lib/migration';

const API = 'https://forgottenrealms.fandom.com/api.php';
const CACHE_PATH = join(DATA_DIR, 'npc-wiki-cache.json');

// Book titles as the wiki cites them, per adventure code
const BOOK_TITLES: Record<string, string> = {
  LMoP: 'Lost Mine of Phandelver',
  HotDQ: 'Hoard of the Dragon Queen',
  RoT: 'The Rise of Tiamat',
  PotA: 'Princes of the Apocalypse',
  OotA: 'Out of the Abyss',
  CoS: 'Curse of Strahd',
  SKT: "Storm King's Thunder",
  ToA: 'Tomb of Annihilation',
};
const bookTitleFor = (code: string) =>
  code.startsWith('TftYP') ? 'Tales from the Yawning Portal' : BOOK_TITLES[code];

export interface WikiNpcEntry {
  title: string;
  sex?: string;
  race?: string;
  occupation?: string;
  home?: string;
  intro?: string;
  physical?: string;
  personality?: string;
}

function stripMarkup(text: string): string {
  let out = text.split(/\n?==/)[0]; // stop at the first section heading
  out = out.replace(/<ref[^>]*\/>/g, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/\[\[(?:File|Image):[^\]]*(?:\[\[[^\]]*\]\][^\]]*)*\]\]/gi, '');
  for (let i = 0; i < 5 && out.includes('{{'); i++) out = out.replace(/\{\{[^{}]*\}\}/g, '');
  out = out.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1');
  out = out.replace(/'''?/g, '').replace(/<[^>]+>/g, '');
  out = out.replace(/\b(?:thumb|left|right|center)\|(?:\d+px\|)?/gi, '');
  out = out.replace(/\b(1\d)\s+century/g, '$1th century');
  return out.replace(/\s+/g, ' ').trim();
}

function parseInfobox(wikitext: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const start = wikitext.search(/\{\{(?:Person|Creature)\b/i);
  if (start === -1) return fields;
  for (const line of wikitext.slice(start).split('\n')) {
    if (/^\}\}/.test(line.trim())) break;
    const match = line.match(/^\|\s*([\w ]+?)\s*=\s*(.+)$/);
    if (match) {
      const value = stripMarkup(match[2]);
      if (value) fields[match[1].trim().toLowerCase()] = value;
    }
  }
  return fields;
}

function extractSection(wikitext: string, heading: string): string | undefined {
  const re = new RegExp(`^==+\\s*${heading}\\s*==+\\s*$([\\s\\S]*?)(?=^==|$(?![\\s\\S]))`, 'im');
  const match = wikitext.match(re);
  if (!match) return undefined;
  const text = stripMarkup(match[1]);
  if (!text) return undefined;
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3).join(' ');
  return sentences.length > 20 ? sentences : undefined;
}

function extractIntro(wikitext: string): string | undefined {
  // First paragraph after the templates that bolds the subject name
  let rest = wikitext;
  for (let i = 0; i < 10; i++) {
    rest = rest.replace(/^\s*\{\{[\s\S]*?\n\}\}\s*/m, '');
    if (!rest.startsWith('{{')) break;
  }
  for (const para of rest.split(/\n{2,}/)) {
    if (!para.includes("'''")) continue;
    const text = stripMarkup(para);
    if (text.length > 40) return text.split(/(?<=[.!?])\s+/).slice(0, 3).join(' ');
  }
  return undefined;
}

function parsePage(wikitext: string): Omit<WikiNpcEntry, 'title'> {
  const box = parseInfobox(wikitext);
  return {
    sex: box.sex,
    race: box.race,
    occupation: box.occupation,
    home: box.home,
    intro: extractIntro(wikitext),
    physical: extractSection(wikitext, 'Description'),
    personality: extractSection(wikitext, 'Personality'),
  };
}

async function fetchBatch(titles: string[]): Promise<Map<string, string>> {
  const url =
    `${API}?action=query&format=json&redirects=1&prop=revisions&rvprop=content&rvslots=main` +
    `&titles=${encodeURIComponent(titles.join('|'))}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'dnd-toolkit-seed/1.0' } });
  if (!res.ok) throw new Error(`Wiki API ${res.status}`);
  const json: any = await res.json();
  const byTitle = new Map<string, string>();
  // Map requested title -> final page through normalization and redirects
  const rename = new Map<string, string>();
  for (const n of json.query.normalized ?? []) rename.set(n.from, n.to);
  for (const r of json.query.redirects ?? []) rename.set(r.from, r.to);
  const resolve = (title: string) => {
    let current = title;
    for (let i = 0; i < 5 && rename.has(current); i++) current = rename.get(current)!;
    return current;
  };
  const pages = new Map<string, string>();
  for (const page of Object.values<any>(json.query.pages ?? {})) {
    const content = page.revisions?.[0]?.slots?.main?.['*'];
    if (content) pages.set(page.title, content);
  }
  for (const title of titles) {
    const content = pages.get(resolve(title));
    if (content) byTitle.set(title, content);
  }
  return byTitle;
}

function titleVariants(name: string): string[] {
  const variants = [name];
  const noHonorific = name.replace(
    /^(?:Sister|Sir|Captain|King|Queen|Madam|Lady|Lord|Baron|Baroness|Chief|Duke|Duchess|Count|Countess|Prince|Princess|Father|Mother|Brother|Deepking|Doctor)\s+/i,
    '',
  );
  if (noHonorific !== name) variants.push(noHonorific);
  const noEpithet = name.replace(/\s+the\s+[A-Z][\w'’-]*$/, '');
  if (noEpithet !== name) variants.push(noEpithet);
  return variants;
}

async function main() {
  const npcs = await prisma.npc.findMany({
    select: { name: true, adventure: { select: { code: true } } },
  });
  console.log(`Fetching wiki data for ${npcs.length} NPCs...`);

  const cache: Record<string, WikiNpcEntry> = existsSync(CACHE_PATH)
    ? JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
    : {};

  // round 1: exact names; round 2: variants for the misses
  const pending = npcs.filter((n) => !cache[`${n.adventure.code}|${n.name.toLowerCase()}`]);
  const rounds: { npc: (typeof npcs)[0]; title: string }[][] = [
    pending.map((npc) => ({ npc, title: npc.name })),
  ];

  let found = 0;
  for (let round = 0; round < 3; round++) {
    const queue = rounds[round];
    if (!queue || queue.length === 0) break;
    const misses: { npc: (typeof npcs)[0]; title: string }[] = [];

    for (let i = 0; i < queue.length; i += 50) {
      const batch = queue.slice(i, i + 50);
      const results = await fetchBatch(batch.map((b) => b.title));
      for (const { npc, title } of batch) {
        const wikitext = results.get(title);
        const bookTitle = bookTitleFor(npc.adventure.code);
        if (wikitext && bookTitle && wikitext.includes(bookTitle)) {
          cache[`${npc.adventure.code}|${npc.name.toLowerCase()}`] = {
            title,
            ...parsePage(wikitext),
          };
          found++;
        } else {
          const variants = titleVariants(npc.name);
          const next = variants[round + 1];
          if (next) misses.push({ npc, title: next });
        }
      }
      process.stdout.write(`  round ${round + 1}: ${Math.min(i + 50, queue.length)}/${queue.length}\r`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log();
    rounds.push(misses);
  }

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
  console.log(`✓ ${found} new wiki entries (${Object.keys(cache).length} total) -> ${CACHE_PATH}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Wiki fetch failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
