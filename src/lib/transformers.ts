import { Prisma } from '../generated/prisma';

export function transformBook(book: any): Prisma.BookCreateInput {
  return {
    id: book.id || crypto.randomUUID(),
    code: book.code || book.source,
    name: book.name,
    type: book.type || 'core',
  };
}

export function transformRace(race: any): Prisma.RaceCreateInput {
  const speed = typeof race.speed === 'number' ? race.speed : (race.speed?.walk || 30);

  return {
    id: crypto.randomUUID(),
    name: race.name,
    source: race.source,
    page: race.page,
    size: race.size,
    speed: speed,
    darkvision: race.darkvision,
    speedFly: race.speed?.fly,
    speedSwim: race.speed?.swim,
    strBonus: race.ability?.str,
    dexBonus: race.ability?.dex,
    conBonus: race.ability?.con,
    intBonus: race.ability?.int,
    wisBonus: race.ability?.wis,
    chaBonus: race.ability?.cha,
    description: race.entries ? JSON.stringify(race.entries) : undefined,
  };
}

export function transformSubrace(subrace: any, raceId: string): Prisma.SubraceCreateInput {
  return {
    id: crypto.randomUUID(),
    race: { connect: { id: raceId } },
    name: subrace.name,
    source: subrace.source,
    page: subrace.page,
    abilityBonuses: subrace.ability ? JSON.stringify(subrace.ability) : undefined,
    description: subrace.entries ? JSON.stringify(subrace.entries) : undefined,
  };
}

export function transformClass(classData: any): Prisma.ClassCreateInput {
  return {
    id: crypto.randomUUID(),
    name: classData.name,
    source: classData.source,
    hitDie: classData.hd?.faces || 8,
    proficiencyStr: classData.proficiency?.includes('str'),
    proficiencyDex: classData.proficiency?.includes('dex'),
    proficiencyCon: classData.proficiency?.includes('con'),
    proficiencyInt: classData.proficiency?.includes('int'),
    proficiencyWis: classData.proficiency?.includes('wis'),
    proficiencyCha: classData.proficiency?.includes('cha'),
    subclassTitle: classData.subclassTitle,
    description: classData.entries ? JSON.stringify(classData.entries) : undefined,
  };
}

export function transformSpell(spell: any): Prisma.SpellCreateInput | null {
  if (!spell || !spell.name) {
    return null;
  }

  let materialDescription: string | undefined;
  if (spell.components?.m) {
    if (typeof spell.components.m === 'string') {
      materialDescription = spell.components.m;
    } else if (typeof spell.components.m === 'object' && spell.components.m.text) {
      materialDescription = spell.components.m.text;
    } else if (typeof spell.components.m === 'object') {
      materialDescription = JSON.stringify(spell.components.m);
    }
  }

  let concentration = false;
  if (spell.duration && Array.isArray(spell.duration)) {
    concentration = spell.duration.some((d: any) => d.concentration === true);
  }

  return {
    id: crypto.randomUUID(),
    name: spell.name,
    source: spell.source || 'Unknown',
    level: spell.level ?? 0,
    school: spell.school,
    castingTime: JSON.stringify(spell.time || []),
    range: JSON.stringify(spell.range || {}),
    components: JSON.stringify(spell.components || {}),
    materialDescription,
    duration: JSON.stringify(spell.duration || []),
    concentration,
    ritual: spell.ritual || false,
    description: JSON.stringify(spell.entries || []),
    higherLevel: spell.entriesHigherLevel ? JSON.stringify(spell.entriesHigherLevel) : undefined,
    damageType: spell.damageInflict?.[0],
    savingThrow: spell.savingThrow?.[0],
    page: spell.page,
  };
}

export function transformCondition(condition: any): Prisma.ConditionCreateInput {
  return {
    id: crypto.randomUUID(),
    name: condition.name,
    source: condition.source,
    description: JSON.stringify(condition.entries || []),
    page: condition.page,
  };
}

export function transformBackground(background: any): Prisma.BackgroundCreateInput {
  let skillProficiencies: string[] = [];
  if (background.skillProficiencies) {
    if (typeof background.skillProficiencies === 'string') {
      skillProficiencies = background.skillProficiencies.split(',').map((s: string) => s.trim());
    } else if (Array.isArray(background.skillProficiencies)) {
      skillProficiencies = background.skillProficiencies;
    }
  }

  let languages: string[] = [];
  if (background.languageProficiencies) {
    languages = Array.isArray(background.languageProficiencies)
      ? background.languageProficiencies
      : [background.languageProficiencies];
  }

  let startingGold: number | undefined;
  if (background.money) {
    const gpMatch = background.money.toString().match(/(\d+)\s*gp/i);
    if (gpMatch) {
      startingGold = parseInt(gpMatch[1], 10);
    }
  }

  let featureName: string | undefined;
  let featureDescription: string | undefined;
  if (background.entries) {
    const featureEntry = background.entries.find((e: any) => e.data?.isFeature || e.name?.includes('Feature'));
    if (featureEntry) {
      featureName = featureEntry.name;
      featureDescription = JSON.stringify(featureEntry.entries || []);
    }
  }

  let suggestedTraits: string[] = [];
  let suggestedIdeals: string[] = [];
  let suggestedBonds: string[] = [];
  let suggestedFlaws: string[] = [];

  if (background.entries) {
    for (const entry of background.entries) {
      if (entry.type === 'table') {
        const name = entry.name?.toLowerCase() || '';
        if (name.includes('personality') || name.includes('trait')) {
          suggestedTraits = entry.rows?.flat().filter((r: any) => typeof r === 'string') || [];
        } else if (name.includes('ideal')) {
          suggestedIdeals = entry.rows?.flat().filter((r: any) => typeof r === 'string') || [];
        } else if (name.includes('bond')) {
          suggestedBonds = entry.rows?.flat().filter((r: any) => typeof r === 'string') || [];
        } else if (name.includes('flaw')) {
          suggestedFlaws = entry.rows?.flat().filter((r: any) => typeof r === 'string') || [];
        }
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    name: background.name,
    source: background.source,
    skillProficiencies: skillProficiencies.length ? JSON.stringify(skillProficiencies) : undefined,
    languages: languages.length ? JSON.stringify(languages) : undefined,
    startingGold,
    featureName,
    featureDescription,
    suggestedTraits: suggestedTraits.length ? JSON.stringify(suggestedTraits) : undefined,
    suggestedIdeals: suggestedIdeals.length ? JSON.stringify(suggestedIdeals) : undefined,
    suggestedBonds: suggestedBonds.length ? JSON.stringify(suggestedBonds) : undefined,
    suggestedFlaws: suggestedFlaws.length ? JSON.stringify(suggestedFlaws) : undefined,
    page: background.page,
  };
}

export function transformFeat(feat: any): Prisma.FeatCreateInput {
  return {
    id: crypto.randomUUID(),
    name: feat.name,
    source: feat.source,
    prerequisite: feat.prerequisite ? JSON.stringify(feat.prerequisite) : undefined,
    abilityBonuses: feat.ability ? JSON.stringify(feat.ability) : undefined,
    description: JSON.stringify(feat.entries || []),
    page: feat.page,
  };
}

export function transformDeity(deity: any): Prisma.DeityCreateInput {
  return {
    id: crypto.randomUUID(),
    name: deity.name,
    source: deity.source,
    pantheon: deity.pantheon,
    alignment: deity.alignment,
    domains: deity.domains ? JSON.stringify(deity.domains) : undefined,
    symbol: deity.symbol,
    description: deity.entries ? JSON.stringify(deity.entries) : undefined,
    page: deity.page,
  };
}

// 5etools item type codes -> normalized categories.
// Armor/weapon codes also set armorType/weaponType for filtering.
const ITEM_TYPE_MAP: Record<string, { type: string; extraTypes?: string[]; subtype?: string; armorType?: string; weaponType?: string }> = {
  A: { type: 'ammunition' },
  AF: { type: 'ammunition', subtype: 'futuristic' },
  AT: { type: 'artisan tools', extraTypes: ['tool'] },
  EXP: { type: 'explosive' },
  G: { type: 'adventuring gear' },
  GS: { type: 'gaming set', extraTypes: ['tool'] },
  HA: { type: 'armor', armorType: 'heavy' },
  MA: { type: 'armor', armorType: 'medium' },
  LA: { type: 'armor', armorType: 'light' },
  S: { type: 'shield', extraTypes: ['armor'], armorType: 'shield' },
  INS: { type: 'instrument', extraTypes: ['tool'] },
  M: { type: 'weapon', weaponType: 'melee' },
  R: { type: 'weapon', weaponType: 'ranged' },
  MNT: { type: 'mount' },
  P: { type: 'potion' },
  RD: { type: 'rod' },
  RG: { type: 'ring' },
  SC: { type: 'scroll' },
  SCF: { type: 'spellcasting focus' },
  SHP: { type: 'vehicle', subtype: 'ship' },
  VEH: { type: 'vehicle' },
  WD: { type: 'wand' },
  T: { type: 'tool' },
  TAH: { type: 'tack and harness' },
  TG: { type: 'trade good' },
  $: { type: 'treasure', subtype: 'gemstone' },
};

// Weapon property codes from basicitems.json itemProperty
const WEAPON_PROPERTY_MAP: Record<string, string> = {
  A: 'ammunition',
  AF: 'ammunition',
  BF: 'burst fire',
  F: 'finesse',
  H: 'heavy',
  L: 'light',
  LD: 'loading',
  R: 'reach',
  RLD: 'reload',
  S: 'special',
  T: 'thrown',
  '2H': 'two-handed',
  V: 'versatile',
};

const DAMAGE_TYPE_MAP: Record<string, string> = {
  B: 'bludgeoning',
  P: 'piercing',
  S: 'slashing',
  N: 'necrotic',
  R: 'radiant',
};

const COIN_TO_GP: Record<string, number> = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };

// DMG magic item price guidelines (typical values per rarity)
const RARITY_VALUE_GP: Record<string, number> = {
  common: 75,
  uncommon: 300,
  rare: 2750,
  'very rare': 27500,
  legendary: 125000,
};

// Parses value strings like "10gp", "2 sp", "1,500gp" into gold pieces
export function parseValueGp(value: string): number | undefined {
  const match = String(value).replace(/,/g, '').match(/^\s*(\d+(?:\.\d+)?)\s*(cp|sp|ep|gp|pp)\s*$/i);
  if (!match) return undefined;
  return parseFloat(match[1]) * COIN_TO_GP[match[2].toLowerCase()];
}

export function transformItem(item: any): Prisma.ItemCreateInput {
  const rarity: string | undefined = item.rarity;
  const isMagic =
    !!(rarity && rarity !== 'None' && rarity !== 'Unknown') || !!item.wondrous || item.reqAttune !== undefined;

  // Resolve type code to normalized categories
  const mapped = ITEM_TYPE_MAP[item.type as string];
  let itemType: string;
  let itemSubtype = mapped?.subtype;
  let extraTypes = mapped?.extraTypes ?? [];
  let armorType = mapped?.armorType;
  let weaponType = mapped?.weaponType;

  if (mapped) {
    itemType = mapped.type;
  } else if (item.wondrous || !item.type) {
    itemType = /^staff\b/i.test(item.name || '') ? 'staff' : 'wondrous item';
  } else {
    itemType = String(item.type).toLowerCase();
  }

  const types = [itemType, ...extraTypes];
  if (isMagic) types.push('magic item');

  const weaponCategory = item.weaponCategory ? String(item.weaponCategory).toLowerCase() : undefined;

  let value: string | undefined;
  let valueGp: number | undefined;
  let valueEstimated = false;

  if (item.value) {
    value = String(item.value);
    valueGp = parseValueGp(value);
  }
  if (valueGp === undefined && isMagic && rarity) {
    valueGp = RARITY_VALUE_GP[rarity.toLowerCase()];
    if (valueGp !== undefined) valueEstimated = true;
  }

  let weight: number | undefined;
  if (item.weight !== undefined && item.weight !== null) {
    const parsed = parseFloat(String(item.weight));
    if (!isNaN(parsed)) weight = parsed;
  }
  if (weight === undefined && item.value) {
    const lbMatch = String(item.value).match(/(\d+(?:\.\d+)?)\s*lb/i);
    if (lbMatch) weight = parseFloat(lbMatch[1]);
  }

  let damage: string | undefined;
  let damageType: string | undefined;

  if (item.damage) {
    if (typeof item.damage === 'string') {
      damage = item.damage;
    } else if (item.damage?.damage) {
      damage = item.damage.damage;
      damageType = item.damage.damageType;
    }
  } else if (item.dmg1) {
    damage = item.dmg2 ? `${item.dmg1}/${item.dmg2}` : item.dmg1;
    damageType = item.dmgType;
  }
  if (damageType && DAMAGE_TYPE_MAP[damageType]) damageType = DAMAGE_TYPE_MAP[damageType];

  let armorClass: number | undefined;
  let stealthDisadvantage = false;

  if (item.ac) {
    if (typeof item.ac === 'number') {
      armorClass = item.ac;
    } else if (typeof item.ac === 'string') {
      armorClass = parseInt(item.ac, 10);
    } else if (item.ac[0]) {
      armorClass = typeof item.ac[0] === 'number' ? item.ac[0] : parseInt(item.ac[0], 10);
    }

    if (item.stealth) {
      stealthDisadvantage = item.stealth === true || item.stealth === 'true';
    }
  }

  const attunement = item.reqAttune !== undefined && item.reqAttune !== false;
  const attunementRequirement =
    typeof item.reqAttune === 'string' && item.reqAttune.toUpperCase() !== 'YES'
      ? item.reqAttune
      : undefined;

  // Synthesize a description for stat-only items (basic weapons, armor, gear)
  let description: string | undefined;
  if (item.entries && item.entries.length > 0) {
    description = JSON.stringify(item.entries);
  } else {
    const parts: string[] = [];
    if (itemType === 'weapon') {
      const props = (item.property || [])
        .map((p: string) => WEAPON_PROPERTY_MAP[p])
        .filter(Boolean);
      let line = `${weaponCategory ? weaponCategory.charAt(0).toUpperCase() + weaponCategory.slice(1) + ' ' : ''}${weaponType} weapon.`;
      if (damage) line += ` Damage: ${damage}${damageType ? ' ' + damageType : ''}.`;
      if (item.range) line += ` Range: ${item.range} ft.`;
      if (props.length > 0) line += ` Properties: ${props.join(', ')}.`;
      parts.push(line);
    } else if (armorType) {
      let line = armorType === 'shield' ? 'Shield.' : `${armorType.charAt(0).toUpperCase() + armorType.slice(1)} armor.`;
      if (armorClass) line += armorType === 'shield' ? ` +${armorClass} AC.` : ` AC ${armorClass}.`;
      if (item.strength) line += ` Requires Strength ${item.strength}.`;
      if (stealthDisadvantage) line += ' Disadvantage on Stealth checks.';
      parts.push(line);
    } else {
      let line = itemType.charAt(0).toUpperCase() + itemType.slice(1) + '.';
      if (value) line += ` Costs ${value}.`;
      if (weight) line += ` Weighs ${weight} lb.`;
      parts.push(line);
    }
    if (parts.length > 0) description = JSON.stringify(parts);
  }

  return {
    id: crypto.randomUUID(),
    name: item.name,
    source: item.source,
    type: itemType,
    types,
    subtype: itemSubtype,
    armorType,
    weaponType,
    weaponCategory,
    rarity,
    attunement,
    attunementRequirement,
    value,
    valueGp,
    valueEstimated,
    weight,
    damage,
    damageType,
    armorClass,
    strengthRequirement: item.strength != null ? parseInt(String(item.strength), 10) || undefined : undefined,
    stealthDisadvantage,
    description,
    page: item.page,
  };
}

export function transformMonster(monster: any): Prisma.MonsterCreateInput {
  const strScore = monster.str || 10;
  const dexScore = monster.dex || 10;
  const conScore = monster.con || 10;
  const intScore = monster.int || 10;
  const wisScore = monster.wis || 10;
  const chaScore = monster.cha || 10;

  let monsterType: string;
  if (typeof monster.type === 'string') {
    monsterType = monster.type;
  } else if (typeof monster.type === 'object' && monster.type.type) {
    monsterType = monster.type.type;
  } else if (typeof monster.type === 'object' && monster.type.swarmSize) {
    monsterType = `swarm of ${monster.type.swarmSize}`;
  } else {
    monsterType = 'unknown';
  }

  let armorClass: number | undefined;
  let armorType: string | undefined;

  if (monster.ac) {
    if (typeof monster.ac === 'number') {
      armorClass = monster.ac;
    } else if (typeof monster.ac === 'string') {
      const match = monster.ac.match(/(\d+)(?:\s*\(([^)]+)\))?/);
      if (match) {
        armorClass = parseInt(match[1], 10);
        armorType = match[2];
      }
    } else if (Array.isArray(monster.ac)) {
      const first = monster.ac[0];
      if (typeof first === 'number') {
        armorClass = first;
      } else if (typeof first === 'string') {
        armorClass = parseInt(first, 10);
      } else if (typeof first === 'object') {
        armorClass = first.ac || first.number;
        armorType = first.from;
      }
    } else if (typeof monster.ac === 'object') {
      armorClass = monster.ac.ac || monster.ac.number;
      armorType = monster.ac.from;
    }
  }

  let hitPointsAvg: number | undefined;
  let hitPointsFormula: string | undefined;

  if (monster.hp) {
    if (typeof monster.hp === 'object') {
      hitPointsAvg = monster.hp.average;
      hitPointsFormula = monster.hp.formula;
    }
  }

  let speedWalk: number | undefined;
  let speedFly: number | undefined;
  let speedSwim: number | undefined;
  let speedClimb: number | undefined;

  const parseSpeed = (val: any): number | undefined => {
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && val !== null) return val.number ?? undefined;
    return undefined;
  };

  if (monster.speed) {
    if (typeof monster.speed === 'object') {
      speedWalk = parseSpeed(monster.speed.walk);
      speedFly = parseSpeed(monster.speed.fly);
      speedSwim = parseSpeed(monster.speed.swim);
      speedClimb = parseSpeed(monster.speed.climb);
    } else if (typeof monster.speed === 'number') {
      speedWalk = monster.speed;
    }
  }

  let crValue: number | undefined;
  const rawCr = typeof monster.cr === 'object' && monster.cr !== null ? monster.cr.cr : monster.cr;
  const crString = rawCr?.toString() || monster.challengeRating;
  if (crString) {
    if (crString.includes('/')) {
      const [num, denom] = crString.split('/');
      crValue = parseInt(num, 10) / parseInt(denom, 10);
    } else {
      crValue = parseFloat(crString) || undefined;
    }
  }

  return {
    id: crypto.randomUUID(),
    name: monster.name,
    source: monster.source,
    size: monster.size,
    monsterType: {
      connectOrCreate: {
        where: { name: monsterType },
        create: { id: crypto.randomUUID(), name: monsterType },
      },
    },
    tags: monster.tags ? JSON.stringify(monster.tags) : undefined,
    alignment: monster.alignment ? JSON.stringify(monster.alignment) : undefined,
    armorClass,
    armorType,
    hitPointsAvg,
    hitPointsFormula,
    speedWalk,
    speedFly,
    speedSwim,
    speedClimb,
    strScore,
    dexScore,
    conScore,
    intScore,
    wisScore,
    chaScore,
    strSave: monster.strSave,
    dexSave: monster.dexSave,
    conSave: monster.conSave,
    intSave: monster.intSave,
    wisSave: monster.wisSave,
    chaSave: monster.chaSave,
    skills: monster.skills ? JSON.stringify(monster.skills) : undefined,
    senses: monster.senses,
    passivePerception: monster.passive,
    languages: monster.languages,
    challengeRating: crString || 'Unknown',
    crValue,
    page: monster.page,
  };
}

export function transformMonsterTrait(trait: any, monsterId: string): Prisma.MonsterTraitUncheckedCreateInput {
  return {
    id: crypto.randomUUID(),
    monsterId,
    name: trait.name,
    description: JSON.stringify(trait.entries || []),
  };
}

export function transformMonsterSpellcasting(sc: any, monsterId: string): Prisma.MonsterTraitUncheckedCreateInput {
  const entries = [
    ...(sc.headerEntries || []),
    ...(sc.footerEntries || []),
  ];
  return {
    id: crypto.randomUUID(),
    monsterId,
    name: sc.name || 'Spellcasting',
    description: JSON.stringify(entries),
  };
}

// Collects unique spell names from {@spell name} / {@spell name|source} tags
// anywhere in a monster's spellcasting blocks (leveled slots, at-will, daily, etc.)
export function extractSpellReferences(spellcasting: any[]): string[] {
  const names = new Set<string>();
  const tagPattern = /\{@spell ([^}|]+)(?:\|[^}]*)?\}/gi;
  for (const match of JSON.stringify(spellcasting).matchAll(tagPattern)) {
    names.add(match[1].trim().toLowerCase());
  }
  return [...names];
}

export function transformMonsterAction(action: any, monsterId: string): Prisma.MonsterActionUncheckedCreateInput {
  return {
    id: crypto.randomUUID(),
    monsterId,
    name: action.name || 'Unknown',
    type: action.type || 'action',
    description: JSON.stringify(action.entries || []),
  };
}

export function transformAdventure(adventure: any, bookId?: string): Prisma.AdventureUncheckedCreateInput {
  return {
    id: crypto.randomUUID(),
    code: adventure.id,
    name: adventure.name,
    storyline: adventure.storyline,
    levelStart: adventure.level?.start,
    levelEnd: adventure.level?.end,
    published: adventure.published ? new Date(adventure.published) : undefined,
    bookId,
  };
}

export interface AdventureImageRef {
  title: string | null;
  path: string;
  url: string;
}

// Turns an internal image path ("adventure/LMoP/Phandalin.jpg") into the URL
// served by the /api/images static route
export function imagePathToUrl(path: string): string {
  return '/api/images/' + path.split('/').map(encodeURIComponent).join('/');
}

// Collects all {type: "image"} entries from a nested 5etools entry tree
export function extractAdventureImages(node: any): AdventureImageRef[] {
  const images: AdventureImageRef[] = [];
  const walk = (x: any) => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (x && typeof x === 'object') {
      if (x.type === 'image' && x.href?.path) {
        images.push({
          title: x.title || null,
          path: x.href.path,
          url: imagePathToUrl(x.href.path),
        });
      }
      for (const value of Object.values(x)) walk(value);
    }
  };
  walk(node);
  return images;
}

export interface CreatureTagRef {
  name: string;
  source: string;
}

// Collects {@creature name|source|display} tags from a nested entry tree.
// The first segment is the canonical creature name; source defaults to MM.
export function extractCreatureTags(node: any): CreatureTagRef[] {
  const tags: CreatureTagRef[] = [];
  const tagPattern = /\{@creature ([^}|]+)(?:\|([^}|]*))?(?:\|[^}]*)?\}/g;
  for (const match of JSON.stringify(node).matchAll(tagPattern)) {
    tags.push({ name: match[1].trim(), source: (match[2] || 'MM').trim() || 'MM' });
  }
  return tags;
}

// Renders 5etools tags to plain text: {@creature goblin|MM|the goblins} -> "the goblins",
// {@spell fireball} -> "fireball". Applied repeatedly for nested tags.
export function cleanEntryTags(text: string): string {
  const tagPattern = /\{@\w+ ([^{}|]+)(?:\|[^{}|]*)?(?:\|([^{}|]*))?(?:\|[^{}]*)?\}/g;
  let result = text;
  for (let i = 0; i < 3 && result.includes('{@'); i++) {
    result = result.replace(tagPattern, (_, name, display) => display || name);
  }
  return result;
}
