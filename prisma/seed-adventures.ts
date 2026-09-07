import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import prisma from '../src/lib/prisma';
import { loadJson, DATA_DIR } from '../src/lib/migration';
import {
  transformAdventure,
  extractAdventureImages,
  extractCreatureTags,
  imagePathToUrl,
  cleanEntryTags,
} from '../src/lib/transformers';

// Books the adventures belong to (the TftYP-* adventures share one book)
const ADVENTURE_BOOKS: { code: string; name: string }[] = [
  { code: 'LMoP', name: 'Lost Mine of Phandelver' },
  { code: 'HotDQ', name: 'Hoard of the Dragon Queen' },
  { code: 'RoT', name: 'The Rise of Tiamat' },
  { code: 'PotA', name: 'Princes of the Apocalypse' },
  { code: 'OotA', name: 'Out of the Abyss' },
  { code: 'CoS', name: 'Curse of Strahd' },
  { code: 'SKT', name: "Storm King's Thunder" },
  { code: 'TftYP', name: 'Tales from the Yawning Portal' },
  { code: 'ToA', name: 'Tomb of Annihilation' },
];

// Generic mobs referenced from core books are never adventure NPCs
const CORE_SOURCES = new Set(['mm', 'phb', 'dmg']);

function bookCodeFor(adventureCode: string): string {
  return adventureCode.startsWith('TftYP') ? 'TftYP' : adventureCode;
}

function adventureFileFor(adventureCode: string): string {
  return `adventure/adventure-${adventureCode.toLowerCase()}.json`;
}

// Case-insensitive lookup of token images in database/data/img/<Source>/
const tokenDirCache = new Map<string, Map<string, string>>();
function findTokenUrl(source: string, name: string): string | undefined {
  let dir = tokenDirCache.get(source);
  if (!dir) {
    dir = new Map();
    const dirPath = join(DATA_DIR, 'img', source);
    if (existsSync(dirPath)) {
      for (const file of readdirSync(dirPath)) {
        dir.set(file.replace(/\.[^.]+$/, '').toLowerCase(), file);
      }
    }
    tokenDirCache.set(source, dir);
  }
  const file = dir.get(name.toLowerCase());
  return file ? imagePathToUrl(`${source}/${file}`) : undefined;
}

function walkEntries(node: any, visit: (n: any) => void) {
  if (Array.isArray(node)) return node.forEach((child) => walkEntries(child, visit));
  if (node && typeof node === 'object') {
    visit(node);
    for (const value of Object.values(node)) walkEntries(value, visit);
  }
}

export interface NpcProfile {
  appearance?: string;
  location?: string;
  description?: string;
  fromBlock?: boolean;
}

// Lore fetched from the Forgotten Realms wiki by prisma/fetch-npc-wiki.ts,
// keyed by "<adventure code>|<npc name lowercase>"
interface WikiNpcEntry {
  title: string;
  sex?: string;
  race?: string;
  occupation?: string;
  home?: string;
  intro?: string;
  physical?: string;
  personality?: string;
}
const WIKI_CACHE_PATH = join(DATA_DIR, 'npc-wiki-cache.json');
const wikiCache: Record<string, WikiNpcEntry> = existsSync(WIKI_CACHE_PATH)
  ? JSON.parse(readFileSync(WIKI_CACHE_PATH, 'utf-8'))
  : {};

// Book text is canonical; wiki lore fills whatever the book didn't give us.
// Curated wiki intros beat scattered-sentence extraction for description.
function mergeWithWiki(profile: NpcProfile, adventureCode: string, npcName: string): NpcProfile {
  const wiki = wikiCache[`${adventureCode}|${npcName.toLowerCase()}`];
  const base = {
    appearance: profile.appearance,
    location: profile.location,
    description: profile.description,
  };
  if (!wiki) return base;

  const sexRace = [wiki.sex, wiki.race].filter(Boolean).join(' ');
  return {
    appearance: base.appearance ?? wiki.physical ?? (sexRace ? `${sexRace}.` : undefined),
    description: profile.fromBlock ? base.description : (wiki.intro ?? base.description),
    location: base.location ?? wiki.home,
  };
}

const RACE_WORDS =
  'human|elf|elven|dwarf|dwarven|halfling|gnome|half-orc|half-elf|tiefling|dragonborn|drow|' +
  'duergar|svirfneblin|goblin|hobgoblin|bugbear|orc|kobold|giant|dragon|vampire|lich|banshee|' +
  'doppelganger|wraith|ghost|hag|naga|yuan-ti|lizardfolk|kenku|tabaxi|aarakocra|grung|troll|' +
  'ogre|oni|demon|devil|genasi|githyanki|githzerai|myconid|derro|quaggoth|kuo-toa|merfolk|' +
  'triton|treant|vistana|vistani|firbolg|goliath|werewolf|wereboar|wererat|revenant|mummy';

// Physical-description vocabulary. Deliberately excludes bare race words:
// "a messenger goblin arrived" says nothing about how the NPC looks.
const STRONG_PHYSICAL_RE = new RegExp(
  '\\b(?:years? old|elderly|middle-aged|tall|short|thin|slender|lean|portly|stout|burly|' +
    'muscular|gaunt|wiry|handsome|beautiful|ugly|hair|haired|bald|beard(?:ed)?|mustache|' +
    'moustache|scar(?:red)?|tattoo(?:ed)?|wears|wearing|dressed|clad|garbed|complexion|' +
    'one-eyed|hulking|towering|lanky|grizzled|wrinkled|weathered|pale|swarthy)\\b',
  'i',
);

// Sentences that establish role, allegiance, or occupation
const ROLE_RE = new RegExp(
  '\\b(?:leader|innkeeper|barkeep|owner|owns|runs|proprietor|agent|member|priest(?:ess)?|' +
    'cleric|acolyte|captain|guard|mayor|townmaster|speaker|noble|lord|lady|king|queen|prince|' +
    'princess|duke|duchess|baron(?:ess)?|count(?:ess)?|jarl|thane|chie(?:f|ftain)|boss|works|' +
    'serves|servant|apprentice|wizard|mage|sorcer\\w*|warlock|druid|bard|monk|merchant|trader|' +
    'trades|smith|farmer|rancher|hunter|scout|spy|assassin|cultist|cult|follower|worships?|' +
    'second-in-command|in charge|commands?|rules|advisor|adviser|represents|steward|castellan|' +
    'quartermaster|shopkeeper|healer|sage|scholar|historian|explorer|adventurer|mercenary|' +
    'bandit|pirate|smuggler|thief|guild|founder|veteran|champion|warden|emissary|ambassador)\\b',
  'i',
);

// Entry headings that aren't real locations
const NON_LOCATION_HEADINGS =
  /^(?:treasure|development|developments?|xp awards?|experience|adjusting|awarding|roleplaying|quest[:s]?|general features|random encounters?|special events?|conclusion|introduction|overview|background|running|adventure hooks?|whispered rumors|important npcs|dramatis personae|npcs\b|friends and foes)/i;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?]["\u201D\u2019']?)\s+(?=[A-Z"({])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Builds a structured profile (appearance / location / description) for an NPC
// from every mention of them across the adventure's text.
const HONORIFICS = new Set([
  'brother', 'sister', 'sir', 'captain', 'king', 'queen', 'madam', 'lady', 'lord',
  'baron', 'baroness', 'chief', 'duke', 'duchess', 'count', 'countess', 'prince',
  'princess', 'father', 'mother', 'deepking', 'doctor', 'dame', 'master', 'mistress',
]);

// The word that uniquely identifies the NPC: "Grigor" for "Brother Grigor",
// not the honorific (which would match every other brother in the book)
function distinctiveName(npcName: string): string {
  const words = npcName.toLowerCase().split(' ');
  return HONORIFICS.has(words[0]) && words[1] ? words[1] : words[0];
}

function extractNpcProfile(sections: any[], npcName: string): NpcProfile {
  const nameLower = npcName.toLowerCase();
  const firstName = distinctiveName(npcName);
  const needles = [nameLower];
  if (nameLower.includes(' ') && firstName.length >= 4 && firstName !== nameLower)
    needles.push(firstName);

  // Dedicated character blocks ("Roleplaying Sildar", or a block named after
  // the NPC) are the canonical text and outrank scattered mentions
  let block: any = null;
  walkEntries(sections, (node) => {
    if (block || typeof node.name !== 'string' || !Array.isArray(node.entries)) return;
    if (!node.entries.some((e: any) => typeof e === 'string' && e.length > 80)) return;
    const entryName = node.name.toLowerCase();
    if (
      entryName === nameLower ||
      entryName === firstName ||
      (entryName.startsWith('roleplaying') && entryName.includes(firstName))
    ) {
      block = node;
    }
  });
  const blockTexts = new Set<string>(
    block ? block.entries.filter((e: any) => typeof e === 'string') : [],
  );

  type Mention = {
    sentence: string;
    order: number;
    isMention: boolean;
    inBlock: boolean;
    path: string[];
  };
  const mentions: Mention[] = [];
  let order = 0;

  // Walk with heading context so mentions know where in the book they live
  const walkWithPath = (node: any, path: string[]) => {
    if (Array.isArray(node)) return node.forEach((child) => walkWithPath(child, path));
    if (node && typeof node === 'object') {
      const nextPath =
        typeof node.name === 'string' && node.name.length > 0 ? [...path, node.name] : path;
      for (const value of Object.values(node)) walkWithPath(value, nextPath);
      return;
    }
    if (typeof node !== 'string') return;
    const inBlock = blockTexts.has(node);
    const cleaned = cleanEntryTags(node);
    if (!inBlock && !needles.some((n) => cleaned.toLowerCase().includes(n))) return;
    const sentences = splitSentences(cleaned);
    let lastWasMention = inBlock;
    for (const sentence of sentences) {
      const isMention = needles.some((n) => sentence.toLowerCase().includes(n));
      // Pronoun follow-ups right after a mention still describe the NPC
      const isFollowup =
        lastWasMention && /^(?:He|She|They|It|His|Her|Their|Its)\b/.test(sentence);
      if (isMention || isFollowup || inBlock) {
        mentions.push({ sentence, order: order++, isMention, inBlock, path });
      }
      lastWasMention = isMention || inBlock || (isFollowup && lastWasMention);
    }
  };
  walkWithPath(sections, []);

  if (mentions.length === 0) return {};

  // Canonical block text first, then document order
  mentions.sort((a, b) => Number(b.inBlock) - Number(a.inBlock) || a.order - b.order);

  // Read-aloud quotes and DM instructions make poor profile text
  const isProse = (s: string) =>
    !/^["\u201C']/.test(s) &&
    !/^(?:If|When|Should)\b/.test(s) &&
    !/\b(?:I|my|our|we)\b/.test(s) &&
    !/\bskip ahead\b|\bsee (?:chapter|part|appendix|the)\b/i.test(s);
  // Sentences with the NPC up front are usually about them, not just near them
  const mentionsEarly = (s: string) => {
    const lower = s.toLowerCase();
    return needles.some((n) => {
      const idx = lower.indexOf(n);
      return idx >= 0 && idx < 80;
    });
  };
  // "Sildar's contact ... is a wizard named Iarno" is about Iarno, not Sildar
  const aboutSomeoneElse = (s: string) =>
    new RegExp(`${firstName}[\\w\u2019']*s\\s`, 'i').test(s) &&
    !new RegExp(`\\b${firstName}\\b(?!['\u2019])`, 'i').test(s);

  const tokens = (s: string) => new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const used: Set<string>[] = [];
  const nearDuplicate = (s: string) => {
    const t = tokens(s);
    for (const u of used) {
      let overlap = 0;
      for (const w of t) if (u.has(w)) overlap++;
      if (overlap / Math.max(1, Math.min(t.size, u.size)) > 0.6) return true;
    }
    return false;
  };

  const pick = (filter: (m: Mention) => boolean, max: number, maxChars: number) => {
    const chosen: string[] = [];
    let chars = 0;
    for (const m of mentions) {
      if (chosen.length >= max || chars >= maxChars) break;
      if (m.sentence.length < 25 || nearDuplicate(m.sentence)) continue;
      if (!filter(m)) continue;
      chosen.push(m.sentence);
      used.push(tokens(m.sentence));
      chars += m.sentence.length;
    }
    return chosen.length > 0 ? chosen.join(' ') : undefined;
  };

  // Description: who the NPC is — role, allegiance, motivation
  const description = block
    ? pick((m) => m.inBlock, 3, 550)
    : pick(
        (m) =>
          m.isMention &&
          isProse(m.sentence) &&
          !aboutSomeoneElse(m.sentence) &&
          ROLE_RE.test(m.sentence) &&
          mentionsEarly(m.sentence),
        2,
        500,
      ) ??
      pick(
        (m) =>
          m.isMention && isProse(m.sentence) && !aboutSomeoneElse(m.sentence) && mentionsEarly(m.sentence),
        2,
        500,
      ) ??
      pick(
        (m) => m.isMention && isProse(m.sentence) && !aboutSomeoneElse(m.sentence) && ROLE_RE.test(m.sentence),
        2,
        500,
      ) ??
      pick((m) => m.isMention && isProse(m.sentence) && !aboutSomeoneElse(m.sentence), 2, 500) ??
      pick((m) => m.isMention, 2, 500);

  // Appearance: strong physical vocabulary, or "X is a <race> ..." identity
  // sentences. Bare race words are too noisy on their own.
  const identityRe = new RegExp(
    `${firstName}[\\w'\u2019-]*(?:\\s+[A-Z][\\w'\u2019-]+)*\\s+(?:is|was)\\s+an?\\s+[^.]*\\b(?:${RACE_WORDS}|male|female|man|woman)\\b`,
    'i',
  );
  const pronounIdentityRe = new RegExp(
    `^(?:He|She|They|It)\\s+(?:is|was)\\s+an?\\s+[^.]*\\b(?:${RACE_WORDS}|male|female|man|woman)\\b`,
  );
  // "a human warrior named Sildar" carries race/gender even without an "is"
  const namedIdentityRe = new RegExp(
    `\\ban?\\s+[^.]{0,50}\\b(?:${RACE_WORDS}|man|woman|male|female)\\b[^.]{0,50}\\bnamed\\s+${firstName}`,
    'i',
  );
  const appearance = pick(
    (m) =>
      isProse(m.sentence) &&
      !aboutSomeoneElse(m.sentence) &&
      !/\bdescrib/i.test(m.sentence) &&
      (STRONG_PHYSICAL_RE.test(m.sentence) ||
        identityRe.test(m.sentence) ||
        pronounIdentityRe.test(m.sentence) ||
        namedIdentityRe.test(m.sentence)),
    2,
    400,
  );

  // Location: deepest meaningful heading over the mentions. Numbered keyed
  // entries ("5. Tresendar Manor") always win; headings naming people don't count.
  let location: string | undefined;
  let best: { score: number; path: string[] } | undefined;
  for (const m of mentions) {
    if (m.path.length === 0) continue;
    const leaf = m.path[m.path.length - 1];
    if (NON_LOCATION_HEADINGS.test(leaf)) continue;
    if (leaf.includes(',')) continue;
    if (leaf.toLowerCase().includes(firstName)) continue;
    const score = (/^\d+[.:]/.test(leaf) ? 100 : 0) + Math.min(m.path.length, 4);
    if (!best || score > best.score) best = { score, path: m.path };
  }
  if (best) {
    const leaf = best.path[best.path.length - 1].replace(/^\d+[.:]?\s*/, '');
    const section = best.path[0];
    location = leaf === section ? section : `${leaf} \u2014 ${section}`;
  }

  return { appearance, location, description, fromBlock: !!block };
}

// A proper name: capitalized words, optional quoted nickname or the/of connectors,
// e.g. 'Gundren Rockseeker', 'Iarno "Glasstaff" Albrek', 'Nezznar the Black Spider'
const PROPER_NAME =
  /[A-Z][\p{L}'’-]+(?: "[A-Z][\p{L}'’-]+")?(?:(?: (?:the|of))? [A-Z][\p{L}'’-]+){0,3}/u;

// Things that get "named" in adventure text but aren't people
const NON_NPC_NAMED = new Set([
  'village', 'town', 'city', 'hamlet', 'settlement', 'kingdom', 'land', 'island',
  'well', 'mine', 'camp', 'fortress', 'castle', 'keep', 'tower', 'stronghold',
  'inn', 'tavern', 'alehouse', 'shop', 'store', 'temple', 'shrine',
  'ship', 'boat', 'vessel', 'forest', 'mountain', 'river', 'lake', 'road', 'trail',
  'sword', 'blade', 'dagger', 'axe', 'hammer', 'warhammer', 'maul', 'gauntlet',
  'helm', 'trident', 'staff', 'bow', 'weapon', 'item', 'artifact', 'book', 'tome',
  'gem', 'jewel', 'stone', 'game', 'festival', 'holiday', 'tribe', 'enclave',
  'order', 'points', 'years', 'form', 'brow', 'legs', 'beard', 'night', 'humor',
]);

function collectStrings(node: any, out: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((child) => collectStrings(child, out));
  else if (node && typeof node === 'object') {
    for (const value of Object.values(node)) collectStrings(value, out);
  } else if (typeof node === 'string') out.push(node);
  return out;
}

interface NamedNpcCandidate {
  name: string;
  contextWords: string[]; // lowercase words before "named", e.g. ["young", "green", "dragon"]
}

// Finds NPCs introduced in prose: "a bugbear named Klarg", "a druid named Reidoth".
// The words before "named" hint at the creature's stat block.
function extractNamedNpcCandidates(sections: any[]): NamedNpcCandidate[] {
  const candidates = new Map<string, NamedNpcCandidate>();
  const pattern = new RegExp(
    `((?:[\\p{L}'’-]+ ){1,3})named (${PROPER_NAME.source})`,
    'gu',
  );
  for (const text of collectStrings(sections)) {
    for (const match of cleanEntryTags(text).matchAll(pattern)) {
      const contextWords = match[1].trim().toLowerCase().split(/\s+/);
      if (NON_NPC_NAMED.has(contextWords[contextWords.length - 1])) continue;
      // Em-dashes written as hyphens glue the next word on ("Iymrith-a blue
      // dragon"); strip trailing function words but keep names like "Mend-nets"
      const name = match[2]
        .trim()
        .replace(
          /-(a|an|the|and|or|but|who|whose|which|is|was|are|were|has|had|looks|it|its|this|that|then|when|where|not|now|one|he|she|they|his|her|their|as|at|in|on|of|with|from|by|for|so|if|to)$/i,
          '',
        );
      const key = name.toLowerCase();
      if (!candidates.has(key)) candidates.set(key, { name, contextWords });
    }
  }
  return [...candidates.values()];
}

// Finds NPCs in bolded roster lists: "{@b Toblen Stonehill} Innkeeper."
// Requires two-plus capitalized words to avoid bolded generic headings.
function extractBoldListNpcs(sections: any[]): string[] {
  const names = new Set<string>();
  const pattern = /^\{@b ([A-Z][\p{L}'’-]+(?: [A-Z][\p{L}'’-]+){1,3})\} /u;
  for (const text of collectStrings(sections)) {
    const match = text.match(pattern);
    if (match) names.add(match[1]);
  }
  return [...names];
}

interface AdventureMapPinDef {
  label: string;
  entryName: string;
  x: number;
  y: number;
}

interface AdventureMapDef {
  sectionOrdinal: number;
  name: string;
  imagePath: string;
  ordinal?: number;
  pins: AdventureMapPinDef[];
}

// Hand-authored map/pin data lives in database/data/adventure-maps/<code>.json
// (optional — most adventures don't have one yet). See lmop.json for the format.
async function seedAdventureMaps(adventureCode: string, adventureId: string): Promise<number> {
  const relativePath = join('adventure-maps', `${adventureCode.toLowerCase()}.json`);
  if (!existsSync(join(DATA_DIR, relativePath))) return 0;

  const mapDefs = loadJson<AdventureMapDef[]>(relativePath);
  const sections = await prisma.adventureSection.findMany({
    where: { adventureId },
    select: { id: true, ordinal: true },
  });
  const sectionIdByOrdinal = new Map(sections.map((s) => [s.ordinal, s.id]));

  let mapCount = 0;
  for (const mapDef of mapDefs) {
    const sectionId = sectionIdByOrdinal.get(mapDef.sectionOrdinal);
    if (!sectionId) {
      console.warn(
        `  ⚠ ${adventureCode} map "${mapDef.name}" references missing section ordinal ${mapDef.sectionOrdinal}, skipping`,
      );
      continue;
    }
    const map = await prisma.adventureMap.create({
      data: {
        sectionId,
        name: mapDef.name,
        imagePath: mapDef.imagePath,
        ordinal: mapDef.ordinal ?? 0,
      },
    });
    await prisma.adventureMapPin.createMany({
      data: mapDef.pins.map((pin) => ({
        mapId: map.id,
        label: pin.label,
        entryName: pin.entryName,
        x: pin.x,
        y: pin.y,
      })),
    });
    mapCount++;
  }
  return mapCount;
}

export async function seedAdventures() {
  console.log('\n🗺️ Seeding Adventures...');

  // Ensure the adventure books exist
  const bookIdByCode = new Map<string, string>();
  for (const book of ADVENTURE_BOOKS) {
    const created = await prisma.book.upsert({
      where: { code: book.code },
      update: { name: book.name, type: 'adventure' },
      create: { ...book, type: 'adventure' },
    });
    bookIdByCode.set(book.code, created.id);
  }
  console.log(`  ✓ ${ADVENTURE_BOOKS.length} adventure books upserted`);

  const adventures = loadJson<{ adventure: any[] }>('adventures.json').adventure;

  // Load every adventure's content up front: NPC detection needs a corpus-wide
  // pass (generic creatures appear lowercase somewhere; named NPCs never do)
  const contentByCode = new Map<string, any[]>();
  const lowercaseNames = new Set<string>();
  for (const adventure of adventures) {
    const file = adventureFileFor(adventure.id);
    try {
      const sections = loadJson<{ data: any[] }>(file).data;
      contentByCode.set(adventure.id, sections);
      for (const tag of extractCreatureTags(sections)) {
        if (/^[a-z]/.test(tag.name)) lowercaseNames.add(tag.name.toLowerCase());
      }
    } catch {
      console.warn(`  ⚠ Missing adventure file ${file}, skipping ${adventure.id}`);
    }
  }

  // Normalize tag source casing (some tags use "pota" instead of "PotA")
  const canonicalSource = new Map<string, string>();
  for (const adventure of adventures) canonicalSource.set(adventure.id.toLowerCase(), adventure.id);
  for (const book of ADVENTURE_BOOKS) canonicalSource.set(book.code.toLowerCase(), book.code);

  // Monster lookup for linking NPCs to stat blocks
  const allMonsters = await prisma.monster.findMany({ select: { id: true, name: true, source: true } });
  type MonsterRef = { id: string; name: string; source: string };
  const monsterByNameSource = new Map<string, MonsterRef>();
  const monsterByName = new Map<string, MonsterRef>();
  for (const monster of allMonsters) {
    const key = monster.name.toLowerCase();
    monsterByNameSource.set(`${key}|${monster.source.toLowerCase()}`, monster);
    if (!monsterByName.has(key)) monsterByName.set(key, monster);
  }

  // "young green dragon named Venomfang" -> Monster "Young Green Dragon":
  // try the longest suffix of the context words that matches a monster name
  function monsterFromContext(contextWords: string[]): MonsterRef | undefined {
    for (let take = Math.min(3, contextWords.length); take >= 1; take--) {
      const candidate = contextWords.slice(-take).join(' ');
      const monster = monsterByName.get(candidate);
      if (monster) return monster;
    }
    return undefined;
  }

  let adventureCount = 0;
  let sectionCount = 0;
  let mapCount = 0;
  let npcCount = 0;
  let npcLinkCount = 0;

  for (const adventure of adventures) {
    const sections = contentByCode.get(adventure.id);
    if (!sections) continue;

    const data = transformAdventure(adventure, bookIdByCode.get(bookCodeFor(adventure.id)));
    const created = await prisma.adventure.upsert({
      where: { code: adventure.id },
      update: { ...data, id: undefined },
      create: data,
    });
    adventureCount++;

    // Recreate sections and NPCs so re-runs don't duplicate
    await prisma.adventureSection.deleteMany({ where: { adventureId: created.id } });
    await prisma.npc.deleteMany({ where: { adventureId: created.id } });

    await prisma.adventureSection.createMany({
      data: sections.map((section, index) => {
        const images = extractAdventureImages(section);
        return {
          adventureId: created.id,
          ordinal: index,
          name: section.name || `Section ${index + 1}`,
          headers: adventure.contents?.[index]?.headers ?? undefined,
          entries: section.entries ?? [],
          images: images.length > 0 ? (images as any) : undefined,
        };
      }),
    });
    sectionCount += sections.length;

    mapCount += await seedAdventureMaps(adventure.id, created.id);

    // NPCs: capitalized creature tags from non-core sources whose name never
    // appears lowercase anywhere (generic mobs do, named characters don't)
    const npcsByKey = new Map<
      string,
      {
        name: string;
        source: string;
        monsterId?: string;
        tokenUrl?: string;
        appearance?: string;
        location?: string;
        description?: string;
      }
    >();
    for (const tag of extractCreatureTags(sections)) {
      const key = tag.name.toLowerCase();
      if (!/^[A-Z]/.test(tag.name)) continue;
      if (CORE_SOURCES.has(tag.source.toLowerCase())) continue;
      if (lowercaseNames.has(key)) continue;
      if (npcsByKey.has(key)) continue;

      const source = canonicalSource.get(tag.source.toLowerCase()) ?? tag.source;
      const monster = monsterByNameSource.get(`${key}|${source.toLowerCase()}`) ?? monsterByName.get(key);
      const name = monster?.name ?? tag.name;
      npcsByKey.set(key, {
        name,
        source,
        monsterId: monster?.id,
        tokenUrl: findTokenUrl(source, name),
        ...mergeWithWiki(extractNpcProfile(sections, name), adventure.id, name),
      });
      if (monster) npcLinkCount++;
    }

    // NPCs without their own stat block: introduced in prose ("a bugbear named
    // Klarg") or listed in bold rosters ("{@b Toblen Stonehill} Innkeeper.")
    const advSource = adventure.id;
    // Skip candidates that are the same person as an existing NPC under a
    // longer or shorter name ("Nezznar" vs "Nezznar the Black Spider",
    // "Grimjaw" vs "Jolliver Grimjaw")
    const conflictsWithExisting = (key: string) => {
      if (npcsByKey.has(key)) return true;
      for (const existing of npcsByKey.keys()) {
        if (
          existing.startsWith(`${key} `) ||
          key.startsWith(`${existing} `) ||
          existing.endsWith(` ${key}`) ||
          key.endsWith(` ${existing}`)
        ) {
          return true;
        }
      }
      return false;
    };

    const proseCandidates = extractNamedNpcCandidates(sections);
    const boldCandidates = extractBoldListNpcs(sections).map((name) => ({
      name,
      contextWords: [] as string[],
    }));

    // Fuller names first ("Kasimir Velikov" beats "Velikov" in the dedupe)
    const allCandidates = [...boldCandidates, ...proseCandidates].sort(
      (a, b) => b.name.split(' ').length - a.name.split(' ').length,
    );

    for (const candidate of allCandidates) {
      const key = candidate.name.toLowerCase();
      if (conflictsWithExisting(key)) continue;

      // The NPC may still have a dedicated stat block we missed, else fall
      // back to the creature type it was introduced as
      const monster =
        monsterByNameSource.get(`${key}|${advSource.toLowerCase()}`) ??
        monsterByName.get(key) ??
        monsterFromContext(candidate.contextWords);

      npcsByKey.set(key, {
        name: candidate.name,
        source: advSource,
        monsterId: monster?.id,
        tokenUrl:
          findTokenUrl(advSource, candidate.name) ??
          (monster ? findTokenUrl(monster.source, monster.name) : undefined),
        ...mergeWithWiki(extractNpcProfile(sections, candidate.name), adventure.id, candidate.name),
      });
      if (monster) npcLinkCount++;
    }

    if (npcsByKey.size > 0) {
      await prisma.npc.createMany({
        data: [...npcsByKey.values()].map((npc) => ({ ...npc, adventureId: created.id })),
      });
      npcCount += npcsByKey.size;
    }

    console.log(`  ✓ ${adventure.id}: ${sections.length} sections, ${npcsByKey.size} NPCs`);
  }

  console.log(`  ✓ ${adventureCount} adventures seeded`);
  console.log(`  ✓ ${sectionCount} sections created`);
  console.log(`  ✓ ${mapCount} interactive maps created`);
  console.log(`  ✓ ${npcCount} NPCs created (${npcLinkCount} linked to monster stat blocks)`);
}

if (require.main === module) {
  seedAdventures()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Adventure seeding failed:', error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
