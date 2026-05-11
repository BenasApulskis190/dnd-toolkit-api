import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Books
  console.log('📚 Seeding books...');
  await prisma.book.createMany({
    data: [
      { code: 'PHB', name: "Player's Handbook", type: 'core' },
      { code: 'MM', name: "Monster Manual", type: 'core' },
      { code: 'DMG', name: "Dungeon Master's Guide", type: 'core' },
      { code: 'XGE', name: "Xanathar's Guide to Everything", type: 'expansion' },
      { code: 'EEPC', name: "Elemental Evil Player's Companion", type: 'expansion' },
      { code: 'VGM', name: "Volo's Guide to Monsters", type: 'expansion' },
      { code: 'MTF', name: "Mordenkainen's Tome of Foes", type: 'expansion' },
      { code: 'SCAG', name: "Sword Coast Adventurer's Guide", type: 'expansion' },
    ],
    skipDuplicates: true,
  });

  // Seed Languages
  console.log('🗣️ Seeding languages...');
  await prisma.language.createMany({
    data: [
      { name: 'Common' },
      { name: 'Elvish' },
      { name: 'Dwarvish' },
      { name: 'Draconic' },
      { name: 'Orc' },
      { name: 'Gnomish' },
      { name: 'Halfling' },
      { name: 'Infernal' },
      { name: 'Primordial' },
      { name: 'Sylvan' },
      { name: 'Undercommon' },
      { name: 'Celestial' },
      { name: 'Abyssal' },
      { name: 'Deep Speech' },
      { name: 'Giant' },
    ],
    skipDuplicates: true,
  });

  // Seed Ability Scores
  console.log('💪 Seeding ability scores...');
  await prisma.abilityScore.createMany({
    data: [
      { abbreviation: 'str', name: 'Strength' },
      { abbreviation: 'dex', name: 'Dexterity' },
      { abbreviation: 'con', name: 'Constitution' },
      { abbreviation: 'int', name: 'Intelligence' },
      { abbreviation: 'wis', name: 'Wisdom' },
      { abbreviation: 'cha', name: 'Charisma' },
    ],
    skipDuplicates: true,
  });

  // Seed Alignments
  console.log('⚖️ Seeding alignments...');
  await prisma.alignment.createMany({
    data: [
      { code: 'LG', name: 'Lawful Good' },
      { code: 'NG', name: 'Neutral Good' },
      { code: 'CG', name: 'Chaotic Good' },
      { code: 'LN', name: 'Lawful Neutral' },
      { code: 'NN', name: 'True Neutral' },
      { code: 'CN', name: 'Chaotic Neutral' },
      { code: 'LE', name: 'Lawful Evil' },
      { code: 'NE', name: 'Neutral Evil' },
      { code: 'CE', name: 'Chaotic Evil' },
    ],
    skipDuplicates: true,
  });

  // Seed Schools of Magic
  console.log('✨ Seeding schools of magic...');
  await prisma.schoolOfMagic.createMany({
    data: [
      { name: 'Abjuration', abbreviation: 'A' },
      { name: 'Conjuration', abbreviation: 'C' },
      { name: 'Divination', abbreviation: 'D' },
      { name: 'Enchantment', abbreviation: 'E' },
      { name: 'Evocation', abbreviation: 'EV' },
      { name: 'Illusion', abbreviation: 'I' },
      { name: 'Necromancy', abbreviation: 'N' },
      { name: 'Transmutation', abbreviation: 'T' },
    ],
    skipDuplicates: true,
  });

  // Seed Damage Types
  console.log('⚔️ Seeding damage types...');
  await prisma.damageType.createMany({
    data: [
      { name: 'acid' },
      { name: 'bludgeoning' },
      { name: 'cold' },
      { name: 'fire' },
      { name: 'force' },
      { name: 'lightning' },
      { name: 'necrotic' },
      { name: 'piercing' },
      { name: 'poison' },
      { name: 'psychic' },
      { name: 'radiant' },
      { name: 'slashing' },
      { name: 'thunder' },
    ],
    skipDuplicates: true,
  });

  // Seed Races
  console.log('🧬 Seeding races...');
  await prisma.race.createMany({
    data: [
      { name: 'Human', source: 'PHB', size: 'M', speed: 30, strBonus: 1, dexBonus: 1, conBonus: 1, intBonus: 1, wisBonus: 1, chaBonus: 1 },
      { name: 'Elf', source: 'PHB', size: 'M', speed: 30, darkvision: 60, dexBonus: 2 },
      { name: 'Dwarf', source: 'PHB', size: 'M', speed: 25, darkvision: 60, conBonus: 2 },
      { name: 'Half-Elf', source: 'PHB', size: 'M', speed: 30, darkvision: 60, chaBonus: 2 },
      { name: 'Half-Orc', source: 'PHB', size: 'M', speed: 30, darkvision: 60, strBonus: 2, conBonus: 1 },
      { name: 'Gnome', source: 'PHB', size: 'S', speed: 25, darkvision: 60, intBonus: 2 },
      { name: 'Halfling', source: 'PHB', size: 'S', speed: 25, dexBonus: 2 },
      { name: 'Dragonborn', source: 'PHB', size: 'M', speed: 30, strBonus: 2, chaBonus: 1 },
      { name: 'Tiefling', source: 'PHB', size: 'M', speed: 30, darkvision: 60, intBonus: 1, chaBonus: 2 },
      { name: 'Aarakocra', source: 'EEPC', size: 'M', speed: 25, dexBonus: 2, wisBonus: 1 },
      { name: 'Genasi', source: 'EEPC', size: 'M', speed: 30, conBonus: 2 },
      { name: 'Goliath', source: 'EEPC', size: 'M', speed: 30, strBonus: 2, conBonus: 1 },
    ],
    skipDuplicates: true,
  });

  // Seed Classes
  console.log('🎭 Seeding classes...');
  await prisma.class.createMany({
    data: [
      { name: 'Barbarian', source: 'PHB', hitDie: 12, proficiencyStr: true, proficiencyCon: true, subclassTitle: 'Primal Path' },
      { name: 'Bard', source: 'PHB', hitDie: 8, proficiencyDex: true, proficiencyCha: true, subclassTitle: 'Bard College' },
      { name: 'Cleric', source: 'PHB', hitDie: 8, proficiencyWis: true, proficiencyCha: true, subclassTitle: 'Divine Domain' },
      { name: 'Druid', source: 'PHB', hitDie: 8, proficiencyInt: true, proficiencyWis: true, subclassTitle: 'Druid Circle' },
      { name: 'Fighter', source: 'PHB', hitDie: 10, proficiencyStr: true, proficiencyCon: true, subclassTitle: 'Martial Archetype' },
      { name: 'Monk', source: 'PHB', hitDie: 8, proficiencyDex: true, proficiencyWis: true, subclassTitle: 'Monastic Tradition' },
      { name: 'Paladin', source: 'PHB', hitDie: 10, proficiencyStr: true, proficiencyWis: true, proficiencyCha: true, subclassTitle: 'Sacred Oath' },
      { name: 'Ranger', source: 'PHB', hitDie: 10, proficiencyDex: true, proficiencyWis: true, subclassTitle: 'Ranger Conclave' },
      { name: 'Rogue', source: 'PHB', hitDie: 8, proficiencyDex: true, subclassTitle: 'Roguish Archetype' },
      { name: 'Sorcerer', source: 'PHB', hitDie: 6, proficiencyCon: true, proficiencyCha: true, subclassTitle: 'Sorcerous Origin' },
      { name: 'Warlock', source: 'PHB', hitDie: 8, proficiencyWis: true, proficiencyCha: true, subclassTitle: 'Otherworldly Patron' },
      { name: 'Wizard', source: 'PHB', hitDie: 6, proficiencyInt: true, proficiencyWis: true, subclassTitle: 'Arcane Tradition' },
    ],
    skipDuplicates: true,
  });

  // Seed Conditions
  console.log('😵 Seeding conditions...');
  await prisma.condition.createMany({
    data: [
      { name: 'Blinded', source: 'PHB', page: 290, description: { items: ['Can\'t see', 'Attack rolls against have advantage', 'Attack rolls have disadvantage'] } },
      { name: 'Charmed', source: 'PHB', page: 290, description: { items: ['Can\'t attack charmer', 'Charmer has advantage on social checks'] } },
      { name: 'Deafened', source: 'PHB', page: 290, description: { items: ['Can\'t hear'] } },
      { name: 'Frightened', source: 'PHB', page: 290, description: { items: ['Disadvantage on checks/attacks while source visible', 'Can\'t move closer to source'] } },
      { name: 'Grappled', source: 'PHB', page: 290, description: { items: ['Speed becomes 0'] } },
      { name: 'Incapacitated', source: 'PHB', page: 290, description: { items: ['Can\'t take actions or reactions'] } },
      { name: 'Invisible', source: 'PHB', page: 291, description: { items: ['Impossible to see', 'Attack rolls against have disadvantage', 'Attack rolls have advantage'] } },
      { name: 'Paralyzed', source: 'PHB', page: 291, description: { items: ['Incapacitated', 'Auto-fail Str/Dex saves', 'Attacks have advantage', 'Critical hits within 5ft'] } },
      { name: 'Petrified', source: 'PHB', page: 291, description: { items: ['Transformed to stone', 'Weight x10', 'Resistance to all damage', 'Immune to poison'] } },
      { name: 'Poisoned', source: 'PHB', page: 292, description: { items: ['Disadvantage on attacks and checks'] } },
      { name: 'Prone', source: 'PHB', page: 292, description: { items: ['Can only crawl', 'Disadvantage on attacks', 'Melee attacks have advantage', 'Ranged attacks have disadvantage'] } },
      { name: 'Restrained', source: 'PHB', page: 292, description: { items: ['Speed 0', 'Attacks have advantage', 'Attacks have disadvantage', 'Disadvantage on Dex saves'] } },
      { name: 'Stunned', source: 'PHB', page: 292, description: { items: ['Incapacitated', 'Auto-fail Str/Dex saves', 'Attacks have advantage'] } },
      { name: 'Unconscious', source: 'PHB', page: 292, description: { items: ['Incapacitated', 'Drop everything', 'Prone', 'Auto-fail Str/Dex saves', 'Attacks have advantage', 'Critical hits within 5ft'] } },
    ],
    skipDuplicates: true,
  });

  // Seed Monster Types
  console.log('🐉 Seeding monster types...');
  const monsterTypes = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'];
  for (const name of monsterTypes) {
    await prisma.monsterType.upsert({
      where: { name },
      update: {},
      create: { id: crypto.randomUUID(), name },
    });
  }

  // Seed Sample Monsters
  console.log('👹 Seeding monsters...');
  const sampleMonsters = [
    { name: 'Goblin', source: 'MM', size: 'S', type: 'humanoid', armorClass: 15, hitPointsAvg: 7, hitPointsFormula: '2d6', speedWalk: 30, strScore: 8, dexScore: 14, conScore: 10, intScore: 10, wisScore: 8, chaScore: 8, passivePerception: 9, languages: 'Common, Goblin', challengeRating: '1/4', crValue: 0.25 },
    { name: 'Hobgoblin', source: 'MM', size: 'M', type: 'humanoid', armorClass: 18, hitPointsAvg: 11, hitPointsFormula: '2d8+2', speedWalk: 30, strScore: 13, dexScore: 12, conScore: 12, intScore: 10, wisScore: 10, chaScore: 9, passivePerception: 10, languages: 'Common, Goblin', challengeRating: '1/2', crValue: 0.5 },
    { name: 'Orc', source: 'MM', size: 'M', type: 'humanoid', armorClass: 13, hitPointsAvg: 15, hitPointsFormula: '2d8+6', speedWalk: 30, strScore: 16, dexScore: 12, conScore: 16, intScore: 7, wisScore: 11, chaScore: 10, passivePerception: 10, languages: 'Common, Orc', challengeRating: '1/2', crValue: 0.5 },
    { name: 'Ogre', source: 'MM', size: 'L', type: 'giant', armorClass: 11, hitPointsAvg: 59, hitPointsFormula: '7d10+21', speedWalk: 40, strScore: 19, dexScore: 8, conScore: 16, intScore: 5, wisScore: 7, chaScore: 7, passivePerception: 8, languages: 'Common, Giant', challengeRating: '2', crValue: 2 },
    { name: 'Troll', source: 'MM', size: 'L', type: 'giant', armorClass: 15, hitPointsAvg: 84, hitPointsFormula: '7d10+42', speedWalk: 30, strScore: 18, dexScore: 13, conScore: 20, intScore: 7, wisScore: 9, chaScore: 7, passivePerception: 13, languages: 'Common', challengeRating: '5', crValue: 5 },
    { name: 'Skeleton', source: 'MM', size: 'M', type: 'undead', armorClass: 13, hitPointsAvg: 13, hitPointsFormula: '2d8+4', speedWalk: 30, strScore: 10, dexScore: 14, conScore: 15, intScore: 6, wisScore: 8, chaScore: 5, passivePerception: 9, languages: 'Understands languages it knew in life', challengeRating: '1/4', crValue: 0.25 },
    { name: 'Zombie', source: 'MM', size: 'M', type: 'undead', armorClass: 8, hitPointsAvg: 22, hitPointsFormula: '3d8+9', speedWalk: 20, strScore: 13, dexScore: 6, conScore: 16, intScore: 3, wisScore: 6, chaScore: 5, passivePerception: 8, languages: 'Understands languages it knew in life', challengeRating: '1/4', crValue: 0.25 },
    { name: 'Wraith', source: 'MM', size: 'M', type: 'undead', armorClass: 13, hitPointsAvg: 67, hitPointsFormula: '9d8+27', speedWalk: 0, speedFly: 60, strScore: 6, dexScore: 16, conScore: 16, intScore: 12, wisScore: 14, chaScore: 15, passivePerception: 12, languages: 'The languages it knew in life', challengeRating: '5', crValue: 5 },
    { name: 'Wolf', source: 'MM', size: 'M', type: 'beast', armorClass: 13, hitPointsAvg: 11, hitPointsFormula: '2d8+2', speedWalk: 40, strScore: 12, dexScore: 15, conScore: 12, intScore: 3, wisScore: 12, chaScore: 6, passivePerception: 13, languages: '—', challengeRating: '1/4', crValue: 0.25 },
    { name: 'Giant Spider', source: 'MM', size: 'L', type: 'beast', armorClass: 14, hitPointsAvg: 26, hitPointsFormula: '4d10+4', speedWalk: 30, speedClimb: 30, strScore: 14, dexScore: 16, conScore: 12, intScore: 2, wisScore: 11, chaScore: 4, passivePerception: 10, languages: '—', challengeRating: '1', crValue: 1 },
  ];
  for (const { type, ...m } of sampleMonsters) {
    await prisma.monster.upsert({
      where: { name_source: { name: m.name, source: m.source } },
      update: {},
      create: {
        ...m,
        monsterType: { connectOrCreate: { where: { name: type }, create: { id: crypto.randomUUID(), name: type } } },
      },
    });
  }

  // Seed Sample Spells
  console.log('✨ Seeding spells...');
  await prisma.spell.createMany({
    data: [
      { name: 'Fire Bolt', source: 'PHB', level: 0, school: 'Evocation', castingTime: { number: 1, unit: 'action' }, range: { type: 'point', distance: { type: 'feet', amount: 120 } }, components: { v: true, s: true }, duration: { type: 'instant' }, concentration: false, description: { entries: ['You hurl a mote of fire at a creature or object within range.'] } },
      { name: 'Light', source: 'PHB', level: 0, school: 'Evocation', castingTime: { number: 1, unit: 'action' }, range: { type: 'point', distance: { type: 'touch' } }, components: { v: true, m: 'a firefly or phosphorescent moss' }, duration: { type: 'timed', duration: { type: 'hours', amount: 1 } }, concentration: false, description: { entries: ['You touch one object that is no larger than 10 feet in any dimension.'] } },
      { name: 'Magic Missile', source: 'PHB', level: 1, school: 'Evocation', castingTime: { number: 1, unit: 'action' }, range: { type: 'point', distance: { type: 'feet', amount: 120 } }, components: { v: true, s: true }, duration: { type: 'instant' }, concentration: false, description: { entries: ['You create three glowing darts of magical force.'] } },
      { name: 'Shield', source: 'PHB', level: 1, school: 'Abjuration', castingTime: { number: 1, unit: 'reaction' }, range: { type: 'point', distance: { type: 'self' } }, components: { v: true, s: true }, duration: { type: 'timed', duration: { type: 'rounds', amount: 1 } }, concentration: true, description: { entries: ['An invisible barrier of magical force appears and protects you.'] } },
      { name: 'Cure Wounds', source: 'PHB', level: 1, school: 'Evocation', castingTime: { number: 1, unit: 'action' }, range: { type: 'point', distance: { type: 'touch' } }, components: { v: true, s: true }, duration: { type: 'instant' }, concentration: false, description: { entries: ['A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.'] } },
      { name: 'Fireball', source: 'PHB', level: 3, school: 'Evocation', castingTime: { number: 1, unit: 'action' }, range: { type: 'point', distance: { type: 'feet', amount: 150 } }, components: { v: true, s: true, m: 'a tiny ball of bat guano and sulfur' }, duration: { type: 'instant' }, concentration: false, description: { entries: ['A bright streak flashes from your pointing finger to a point you choose within range.'] } },
      { name: 'Haste', source: 'PHB', level: 3, school: 'Transmutation', castingTime: { number: 1, unit: 'action' }, range: { type: 'point', distance: { type: 'feet', amount: 30 } }, components: { v: true, s: true, m: 'a shaving of licorice root' }, duration: { type: 'timed', duration: { type: 'minutes', amount: 1 } }, concentration: true, description: { entries: ['Choose a willing creature that you can see within range.'] } },
      { name: 'Counterspell', source: 'PHB', level: 3, school: 'Abjuration', castingTime: { number: 1, unit: 'reaction' }, range: { type: 'point', distance: { type: 'feet', amount: 60 } }, components: { v: true, s: true }, duration: { type: 'instant' }, concentration: false, description: { entries: ['You attempt to interrupt a creature in the process of casting a spell.'] } },
    ],
    skipDuplicates: true,
  });

  // Seed Sample Backgrounds
  console.log('🎒 Seeding backgrounds...');
  await prisma.background.createMany({
    data: [
      { name: 'Acolyte', source: 'PHB', page: 127, featureName: 'Shelter of the Faithful', skillProficiencies: ['Insight', 'Religion'] },
      { name: 'Charlatan', source: 'PHB', page: 128, featureName: 'False Identity', skillProficiencies: ['Deception', 'Sleight of Hand'] },
      { name: 'Criminal', source: 'PHB', page: 129, featureName: 'Criminal Contact', skillProficiencies: ['Deception', 'Stealth'] },
      { name: 'Entertainer', source: 'PHB', page: 130, featureName: 'By Popular Demand', skillProficiencies: ['Acrobatics', 'Performance'] },
      { name: 'Folk Hero', source: 'PHB', page: 131, featureName: 'Rustic Hospitality', skillProficiencies: ['Animal Handling', 'Survival'] },
      { name: 'Guild Artisan', source: 'PHB', page: 132, featureName: 'Guild Membership', skillProficiencies: ['Insight', 'Persuasion'] },
      { name: 'Hermit', source: 'PHB', page: 133, featureName: 'Discovery', skillProficiencies: ['Medicine', 'Religion'] },
      { name: 'Noble', source: 'PHB', page: 135, featureName: 'Position of Privilege', skillProficiencies: ['History', 'Persuasion'] },
      { name: 'Outlander', source: 'PHB', page: 136, featureName: 'Wanderer', skillProficiencies: ['Athletics', 'Survival'] },
      { name: 'Sage', source: 'PHB', page: 137, featureName: 'Researcher', skillProficiencies: ['Arcana', 'History'] },
      { name: 'Sailor', source: 'PHB', page: 139, featureName: "Ship's Passage", skillProficiencies: ['Athletics', 'Perception'] },
      { name: 'Soldier', source: 'PHB', page: 140, featureName: 'Military Rank', skillProficiencies: ['Athletics', 'Intimidation'] },
    ],
    skipDuplicates: true,
  });

  // Seed Sample Characters
  console.log('🧙 Seeding characters...');
  const genasi = await prisma.race.findFirst({ where: { name: 'Genasi' } });
  const tiefling = await prisma.race.findFirst({ where: { name: 'Tiefling' } });
  const elf = await prisma.race.findFirst({ where: { name: 'Elf' } });
  const dwarf = await prisma.race.findFirst({ where: { name: 'Dwarf' } });
  const halfElf = await prisma.race.findFirst({ where: { name: 'Half-Elf' } });
  const dragonborn = await prisma.race.findFirst({ where: { name: 'Dragonborn' } });
  const wizard = await prisma.class.findFirst({ where: { name: 'Wizard' } });
  const sorcerer = await prisma.class.findFirst({ where: { name: 'Sorcerer' } });
  const warlock = await prisma.class.findFirst({ where: { name: 'Warlock' } });
  const bard = await prisma.class.findFirst({ where: { name: 'Bard' } });
  const rogue = await prisma.class.findFirst({ where: { name: 'Rogue' } });

  // Create a party
  const party = await prisma.party.create({
    data: { name: 'The Adventuring Party', description: 'A group of heroes seeking glory and adventure' },
  });

  // Create characters
  if (genasi && sorcerer) {
    await prisma.character.create({
      data: {
        partyId: party.id,
        name: 'Virex the Cataclysm',
        playerName: 'Tomas',
        level: 5,
        raceId: genasi.id,
        classId: sorcerer.id,
        maxHp: 40,
        currentHp: 40,
        strScore: 9,
        dexScore: 14,
        conScore: 14,
        intScore: 17,
        wisScore: 11,
        chaScore: 16,
      },
    });
  }

  if (tiefling && sorcerer) {
    await prisma.character.create({
      data: {
        partyId: party.id,
        name: 'Fizz',
        playerName: 'Arturas',
        level: 5,
        raceId: tiefling.id,
        classId: sorcerer.id,
        maxHp: 32,
        currentHp: 32,
        strScore: 10,
        dexScore: 16,
        conScore: 12,
        intScore: 11,
        wisScore: 9,
        chaScore: 15,
      },
    });
  }

  if (elf && warlock) {
    await prisma.character.create({
      data: {
        partyId: party.id,
        name: 'Yoric',
        playerName: 'Arta',
        level: 5,
        raceId: elf.id,
        classId: warlock.id,
        maxHp: 41,
        currentHp: 41,
        strScore: 10,
        dexScore: 14,
        conScore: 12,
        intScore: 13,
        wisScore: 14,
        chaScore: 12,
      },
    });
  }

  if (dwarf && bard) {
    await prisma.character.create({
      data: {
        partyId: party.id,
        name: 'Hodolf',
        playerName: 'Benas',
        level: 5,
        raceId: dwarf.id,
        classId: bard.id,
        maxHp: 62,
        currentHp: 62,
        strScore: 14,
        dexScore: 12,
        conScore: 16,
        intScore: 10,
        wisScore: 13,
        chaScore: 14,
      },
    });
  }

  if (halfElf && rogue) {
    await prisma.character.create({
      data: {
        partyId: party.id,
        name: 'Vire',
        playerName: 'Tadas',
        level: 5,
        raceId: halfElf.id,
        classId: rogue.id,
        maxHp: 50,
        currentHp: 50,
        strScore: 12,
        dexScore: 18,
        conScore: 14,
        intScore: 14,
        wisScore: 12,
        chaScore: 16,
      },
    });
  }

  if (dragonborn && rogue) {
    await prisma.character.create({
      data: {
        partyId: party.id,
        name: 'Sazaras',
        playerName: 'Mantelis',
        level: 5,
        raceId: dragonborn.id,
        classId: rogue.id,
        maxHp: 37,
        currentHp: 37,
        strScore: 14,
        dexScore: 16,
        conScore: 12,
        intScore: 12,
        wisScore: 10,
        chaScore: 8,
      },
    });
  }

  // Seed Sample Encounters
  console.log('⚔️ Seeding encounters...');
  const goblin = await prisma.monster.findFirst({ where: { name: 'Goblin' } });
  const hobgoblin = await prisma.monster.findFirst({ where: { name: 'Hobgoblin' } });
  const wraith = await prisma.monster.findFirst({ where: { name: 'Wraith' } });
  const zombie = await prisma.monster.findFirst({ where: { name: 'Zombie' } });

  if (goblin && hobgoblin) {
    const encounter = await prisma.encounter.create({
      data: {
        name: 'Goblin Ambush',
        difficulty: 'medium',
        partyLevel: 5,
        description: 'A group of goblins led by a hobgoblin lie in wait.',
      },
    });

    await prisma.encounterMonster.createMany({
      data: [
        { encounterId: encounter.id, monsterId: goblin.id, quantity: 4, maxHp: goblin.hitPointsAvg },
        { encounterId: encounter.id, monsterId: hobgoblin.id, quantity: 1, maxHp: hobgoblin.hitPointsAvg },
      ],
    });
  }

  if (wraith && zombie) {
    const undeadEncounter = await prisma.encounter.create({
      data: {
        name: 'Undead Horror',
        difficulty: 'hard',
        partyLevel: 5,
        description: 'A wraith and its zombie minions emerge from the shadows.',
      },
    });

    await prisma.encounterMonster.createMany({
      data: [
        { encounterId: undeadEncounter.id, monsterId: wraith.id, quantity: 1, maxHp: wraith.hitPointsAvg },
        { encounterId: undeadEncounter.id, monsterId: zombie.id, quantity: 2, maxHp: zombie.hitPointsAvg },
      ],
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
