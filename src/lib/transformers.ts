import { Prisma } from '../generated/prisma';

export function transformBook(book: any): Prisma.BookCreateInput {
  return {
    id: book.id || crypto.randomUUID(),
    code: book.code || book.source,
    name: book.name,
    type: book.type || 'core',
  };
}

export function transformLanguage(name: string): Prisma.LanguageCreateInput {
  return {
    id: crypto.randomUUID(),
    name,
  };
}

export function transformAbilityScore(abbrev: string, name: string): Prisma.AbilityScoreCreateInput {
  return {
    id: crypto.randomUUID(),
    abbreviation: abbrev,
    name,
  };
}

export function transformAlignment(code: string, name: string): Prisma.AlignmentCreateInput {
  return {
    id: crypto.randomUUID(),
    code,
    name,
  };
}

export function transformDamageType(name: string, description?: string): Prisma.DamageTypeCreateInput {
  return {
    id: crypto.randomUUID(),
    name,
    description,
  };
}

export function transformSchoolOfMagic(code: string, name: string): Prisma.SchoolOfMagicCreateInput {
  return {
    id: crypto.randomUUID(),
    abbreviation: code,
    name,
  };
}

export function transformSkill(name: string, abilityScore: string, description?: string): Prisma.SkillCreateInput {
  return {
    id: crypto.randomUUID(),
    name,
    ability_score: abilityScore,
    abilityScore: { connect: { abbreviation: abilityScore } },
    description,
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
    description: race.entries ? JSON.stringify(race.entries) : null,
  };
}

export function transformSubrace(subrace: any, raceId: string): Prisma.SubraceCreateInput {
  return {
    id: crypto.randomUUID(),
    raceId,
    name: subrace.name,
    source: subrace.source,
    page: subrace.page,
    abilityBonuses: subrace.ability ? JSON.stringify(subrace.ability) : null,
    description: subrace.entries ? JSON.stringify(subrace.entries) : null,
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
    description: classData.entries ? JSON.stringify(classData.entries) : null,
  };
}

export function transformClassFeature(feature: any, classId: string): Prisma.ClassFeatureCreateInput {
  return {
    id: crypto.randomUUID(),
    classId,
    name: feature.name,
    level: feature.level,
    description: JSON.stringify(feature.entries || feature),
    gainSubclassFeature: feature.gainSubclassFeature || false,
  };
}

export function transformSubclass(subclass: any, classId: string): Prisma.SubclassCreateInput {
  return {
    id: crypto.randomUUID(),
    classId,
    name: subclass.name,
    shortName: subclass.shortName,
    source: subclass.source,
    description: subclass.entries ? JSON.stringify(subclass.entries) : null,
  };
}

export function transformSubclassFeature(feature: any, subclassId: string): Prisma.SubclassFeatureCreateInput {
  return {
    id: crypto.randomUUID(),
    subclassId,
    name: feature.name,
    level: feature.level,
    description: JSON.stringify(feature.entries || feature),
  };
}

export function transformSpell(spell: any): Prisma.SpellCreateInput | null {
  if (!spell || !spell.name) {
    return null;
  }
  
  // Handle material description which can be string or object
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

  // Handle concentration
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
    higherLevel: spell.entriesHigherLevel ? JSON.stringify(spell.entriesHigherLevel) : null,
    damageType: spell.damageInflict?.[0],
    savingThrow: spell.savingThrow?.[0],
    page: spell.page,
  };
}

export function transformSpellClass(
  spellId: string,
  className: string,
  classSource: string,
  fromSubclass: boolean = false,
  subclassId?: string
): Prisma.SpellClassCreateInput {
  return {
    id: crypto.randomUUID(),
    spellId,
    classId: '', // Will be resolved after class lookup
    className,
    classSource,
    fromSubclass,
    subclassId,
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
  // Extract skill proficiencies
  let skillProficiencies: string[] = [];
  if (background.skillProficiencies) {
    if (typeof background.skillProficiencies === 'string') {
      skillProficiencies = background.skillProficiencies.split(',').map((s: string) => s.trim());
    } else if (Array.isArray(background.skillProficiencies)) {
      skillProficiencies = background.skillProficiencies;
    }
  }

  // Extract languages
  let languages: string[] = [];
  if (background.languageProficiencies) {
    languages = Array.isArray(background.languageProficiencies) 
      ? background.languageProficiencies 
      : [background.languageProficiencies];
  }

  // Extract starting gold
  let startingGold: number | undefined;
  if (background.money) {
    const gpMatch = background.money.toString().match(/(\d+)\s*gp/i);
    if (gpMatch) {
      startingGold = parseInt(gpMatch[1], 10);
    }
  }

  // Extract feature
  let featureName: string | undefined;
  let featureDescription: string | undefined;
  if (background.entries) {
    const featureEntry = background.entries.find((e: any) => e.data?.isFeature || e.name?.includes('Feature'));
    if (featureEntry) {
      featureName = featureEntry.name;
      featureDescription = JSON.stringify(featureEntry.entries || []);
    }
  }

  // Extract suggested traits, ideals, bonds, flaws
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
    skillProficiencies: skillProficiencies.length ? JSON.stringify(skillProficiencies) : null,
    languages: languages.length ? JSON.stringify(languages) : null,
    startingGold,
    featureName,
    featureDescription,
    suggestedTraits: suggestedTraits.length ? JSON.stringify(suggestedTraits) : null,
    suggestedIdeals: suggestedIdeals.length ? JSON.stringify(suggestedIdeals) : null,
    suggestedBonds: suggestedBonds.length ? JSON.stringify(suggestedBonds) : null,
    suggestedFlaws: suggestedFlaws.length ? JSON.stringify(suggestedFlaws) : null,
    page: background.page,
  };
}

export function transformFeat(feat: any): Prisma.FeatCreateInput {
  return {
    id: crypto.randomUUID(),
    name: feat.name,
    source: feat.source,
    prerequisite: feat.prerequisite ? JSON.stringify(feat.prerequisite) : null,
    abilityBonuses: feat.ability ? JSON.stringify(feat.ability) : null,
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
    domains: deity.domains ? JSON.stringify(deity.domains) : null,
    symbol: deity.symbol,
    description: deity.entries ? JSON.stringify(deity.entries) : null,
    page: deity.page,
  };
}

export function transformItem(item: any): Prisma.ItemCreateInput {
  // Parse item type
  const itemTypeRaw = item.type || '';
  let itemType = itemTypeRaw;
  let itemSubtype: string | undefined;
  
  if (itemTypeRaw.startsWith('$')) {
    itemType = 'gemstone';
    itemSubtype = 'gemstone';
  } else if (itemTypeRaw.startsWith('WD')) {
    itemType = 'weapon';
    itemSubtype = itemTypeRaw.replace('WD', '').toLowerCase();
  } else if (itemTypeRaw.startsWith('AR')) {
    itemType = 'armor';
    itemSubtype = itemTypeRaw.replace('AR', '').toLowerCase();
  }

  // Parse value
  let value: string | undefined;
  let weight: number | undefined;
  
  if (item.value) {
    value = item.value;
    const gpMatch = item.value.match(/(\d+(?:\.\d+)?)\s*lb/i);
    if (gpMatch) {
      weight = parseFloat(gpMatch[1]);
    }
  }

  // Parse damage
  let damage: string | undefined;
  let damageType: string | undefined;
  
  if (item.damage) {
    if (typeof item.damage === 'string') {
      damage = item.damage;
    } else if (item.damage?.damage) {
      damage = item.damage.damage;
      damageType = item.damage.damageType;
    }
  }

  // Parse armor class
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

  return {
    id: crypto.randomUUID(),
    name: item.name,
    source: item.source,
    type: itemType,
    subtype: itemSubtype,
    rarity: item.rarity,
    attunement: item.requirement?.toLowerCase().includes('attunement') || false,
    value,
    weight,
    damage,
    damageType,
    armorClass,
    strengthRequirement: item.strength,
    stealthDisadvantage,
    description: item.entries ? JSON.stringify(item.entries) : null,
    page: item.page,
  };
}

export function transformMonster(monster: any): Prisma.MonsterCreateInput {
  // Parse ability scores
  const strScore = monster.str || 10;
  const dexScore = monster.dex || 10;
  const conScore = monster.con || 10;
  const intScore = monster.int || 10;
  const wisScore = monster.wis || 10;
  const chaScore = monster.cha || 10;

  // Parse type - can be string or object
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

  // Parse AC
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

  // Parse HP
  let hitPointsAvg: number | undefined;
  let hitPointsFormula: string | undefined;
  
  if (monster.hp) {
    if (typeof monster.hp === 'object') {
      hitPointsAvg = monster.hp.average;
      hitPointsFormula = monster.hp.formula;
    }
  }

  // Parse speed
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

  // Parse CR — can be a string ("13"), fraction ("1/2"), or object ({ cr: "13", lair: "14" })
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
    tags: monster.tags ? JSON.stringify(monster.tags) : null,
    alignment: monster.alignment ? JSON.stringify(monster.alignment) : null,
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
    skills: monster.skills ? JSON.stringify(monster.skills) : null,
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

export function transformMonsterAction(action: any, monsterId: string): Prisma.MonsterActionUncheckedCreateInput {
  return {
    id: crypto.randomUUID(),
    monsterId,
    name: action.name || 'Unknown',
    type: action.type || 'action',
    description: JSON.stringify(action.entries || []),
  };
}
