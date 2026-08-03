import prisma from '../src/lib/prisma';
import {
  loadJson,
  loadSpellsDir,
  loadMonstersDir,
  clearAllTables,
  getStats,
} from '../src/lib/migration';
import { seedAdventures } from './seed-adventures';
import { seedItems } from './seed-items';
import {
  transformRace,
  transformSubrace,
  transformClass,
  transformSpell,
  transformCondition,
  transformBackground,
  transformFeat,
  transformDeity,
  transformMonster,
  transformMonsterTrait,
  transformMonsterSpellcasting,
  transformMonsterAction,
  extractSpellReferences,
} from '../src/lib/transformers';

async function seedBooks() {
  console.log('\n📚 Seeding Books...');
  
  const booksData = [
    { code: 'PHB', name: "Player's Handbook", type: 'core' },
    { code: 'MM', name: "Monster Manual", type: 'core' },
    { code: 'DMG', name: "Dungeon Master's Guide", type: 'core' },
    { code: 'XGE', name: "Xanathar's Guide to Everything", type: 'expansion' },
    { code: 'EEPC', name: "Elemental Evil Player's Companion", type: 'expansion' },
    { code: 'VGM', name: "Volo's Guide to Monsters", type: 'expansion' },
    { code: 'MTF', name: "Mordenkainen's Tome of Foes", type: 'expansion' },
    { code: 'SCAG', name: "Sword Coast Adventurer's Guide", type: 'expansion' },
    { code: 'TCE', name: "Tasha's Cauldron of Everything", type: 'expansion' },
    { code: 'WMM', name: "Wildemount", type: 'expansion' },
  ];

  for (const book of booksData) {
    await prisma.book.upsert({
      where: { code: book.code },
      update: { name: book.name, type: book.type },
      create: book,
    });
  }
  
  console.log(`  ✓ ${booksData.length} books seeded`);
  return booksData;
}

async function seedLanguages() {
  console.log('\n🗣️ Seeding Languages...');
  
  const languages = [
    'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin',
    'Halfling', 'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech',
    'Infernal', 'Primordial', 'Sylvan', 'Undercommon', 'Druidic', 'Thieves\' Cant',
    'Aarakocra', 'Auran', 'Aquan', 'Ignan', 'Terran', 'Telepathy'
  ];

  let count = 0;
  for (const name of languages) {
    await prisma.language.upsert({
      where: { name },
      update: {},
      create: { id: crypto.randomUUID(), name },
    });
    count++;
  }
  
  console.log(`  ✓ ${count} languages seeded`);
  return languages;
}

async function seedAbilityScores() {
  console.log('\n💪 Seeding Ability Scores...');
  
  const scores = [
    { abbreviation: 'STR', name: 'Strength' },
    { abbreviation: 'DEX', name: 'Dexterity' },
    { abbreviation: 'CON', name: 'Constitution' },
    { abbreviation: 'INT', name: 'Intelligence' },
    { abbreviation: 'WIS', name: 'Wisdom' },
    { abbreviation: 'CHA', name: 'Charisma' },
  ];

  for (const score of scores) {
    await prisma.abilityScore.upsert({
      where: { abbreviation: score.abbreviation },
      update: { name: score.name },
      create: score,
    });
  }
  
  console.log(`  ✓ ${scores.length} ability scores seeded`);
}

async function seedAlignments() {
  console.log('\n⚖️ Seeding Alignments...');
  
  const alignments = [
    { code: 'LG', name: 'Lawful Good' },
    { code: 'NG', name: 'Neutral Good' },
    { code: 'CG', name: 'Chaotic Good' },
    { code: 'LN', name: 'Lawful Neutral' },
    { code: 'TN', name: 'True Neutral' },
    { code: 'CN', name: 'Chaotic Neutral' },
    { code: 'LE', name: 'Lawful Evil' },
    { code: 'NE', name: 'Neutral Evil' },
    { code: 'CE', name: 'Chaotic Evil' },
    { code: 'U', name: 'Unaligned' },
  ];

  for (const alignment of alignments) {
    await prisma.alignment.upsert({
      where: { code: alignment.code },
      update: {},
      create: alignment,
    });
  }
  
  console.log(`  ✓ ${alignments.length} alignments seeded`);
}

async function seedSchoolsOfMagic() {
  console.log('\n✨ Seeding Schools of Magic...');
  
  const schools = [
    { abbreviation: 'A', name: 'Abjuration' },
    { abbreviation: 'C', name: 'Conjuration' },
    { abbreviation: 'D', name: 'Divination' },
    { abbreviation: 'EN', name: 'Enchantment' },
    { abbreviation: 'EV', name: 'Evocation' },
    { abbreviation: 'I', name: 'Illusion' },
    { abbreviation: 'N', name: 'Necromancy' },
    { abbreviation: 'T', name: 'Transmutation' },
    { abbreviation: 'P', name: 'Psionic' },
  ];

  for (const school of schools) {
    await prisma.schoolOfMagic.upsert({
      where: { name: school.name },
      update: { abbreviation: school.abbreviation },
      create: { id: crypto.randomUUID(), ...school },
    });
  }
  
  console.log(`  ✓ ${schools.length} schools seeded`);
}

async function seedDamageTypes() {
  console.log('\n💥 Seeding Damage Types...');
  
  const types = [
    'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
    'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing',
    'thunder', 'physical'
  ];

  for (const name of types) {
    await prisma.damageType.upsert({
      where: { name },
      update: {},
      create: { id: crypto.randomUUID(), name },
    });
  }
  
  console.log(`  ✓ ${types.length} damage types seeded`);
}

async function seedRaces() {
  console.log('\n🧬 Seeding Races...');
  
  const racesData = loadJson<{ race: any[] }>('races.json');
  const races = racesData.race;
  
  const raceIdMap = new Map<string, string>();
  let count = 0;
  let errorCount = 0;
  
  for (const race of races) {
    try {
      const raceId = crypto.randomUUID();
      raceIdMap.set(`${race.name}|${race.source}`, raceId);
      
      const data = transformRace(race);
      data.id = raceId;
      
      await prisma.race.upsert({
        where: { name_source: { name: race.name, source: race.source } },
        update: data,
        create: data,
      });
      count++;
      
      // Handle subraces
      if (race.subraces && Array.isArray(race.subraces)) {
        for (const subrace of race.subraces) {
          if (!subrace.name) {
            console.warn(`  ⚠ Subrace without name for race ${race.name}, skipping`);
            continue;
          }
          const subraceData = transformSubrace(subrace, raceId);
          await prisma.subrace.upsert({
            where: { raceId_name: { raceId, name: subrace.name } },
            update: subraceData,
            create: subraceData,
          });
        }
        console.log(`  ✓ ${race.name} (${race.subraces.length} subraces)`);
      }
    } catch (error: any) {
      errorCount++;
      if (errorCount <= 5) {
        console.error(`  ✗ Error seeding race ${race?.name}: ${error.message}`);
      }
    }
    
    if (count % 10 === 0) console.log(`  Processed ${count} races...`);
  }
  
  if (errorCount > 0) {
    console.log(`  ⚠ ${errorCount} errors encountered`);
  }
  console.log(`  ✓ ${count} races seeded`);
  return raceIdMap;
}

async function seedClasses() {
  console.log('\n🎭 Seeding Classes...');

  const classesData = loadJson<{ class: any[] }>('classes.json');
  const classes = classesData.class;

  const classIdMap = new Map<string, string>();
  const subclassIdMap = new Map<string, string>(); // "ClassName|SubclassName" -> subclassId
  let count = 0;

  for (const classData of classes) {
    try {
      const classId = crypto.randomUUID();
      classIdMap.set(classData.name, classId);

      const data = transformClass(classData);
      data.id = classId;

      await prisma.class.upsert({
        where: { name: classData.name },
        update: data,
        create: data,
      });
      count++;

      // Handle class features - classFeatures is array of arrays by level
      // Level = index + 1
      if (classData.classFeatures && Array.isArray(classData.classFeatures)) {
        for (let level = 0; level < classData.classFeatures.length; level++) {
          const featuresAtLevel = classData.classFeatures[level];
          if (Array.isArray(featuresAtLevel)) {
            for (const feature of featuresAtLevel) {
              if (!feature.name) continue;
              const featureData = {
                id: crypto.randomUUID(),
                classId,
                name: feature.name,
                level: level + 1,
                description: JSON.stringify(feature.entries || []),
                gainSubclassFeature: feature.gainSubclassFeature || false,
              };
              await prisma.classFeature.create({ data: featureData });
            }
          }
        }
      }

      // Handle subclasses
      if (classData.subclasses && Array.isArray(classData.subclasses)) {
        for (const subclass of classData.subclasses) {
          const subclassData = {
            id: crypto.randomUUID(),
            classId,
            name: subclass.name,
            shortName: subclass.shortName,
            source: subclass.source,
            description: subclass.entries ? JSON.stringify(subclass.entries) : undefined,
          };
          const created = await prisma.subclass.upsert({
            where: { classId_name: { classId, name: subclass.name } },
            update: subclassData,
            create: subclassData,
          });
          subclassIdMap.set(`${classData.name}|${subclass.shortName ?? subclass.name}`, created.id);

          // Handle subclass features
          if (subclass.subclassFeatures && Array.isArray(subclass.subclassFeatures)) {
            for (let level = 0; level < subclass.subclassFeatures.length; level++) {
              const featuresAtLevel = subclass.subclassFeatures[level];
              if (Array.isArray(featuresAtLevel)) {
                for (const feature of featuresAtLevel) {
                  if (!feature.name) continue;
                  const featureData = {
                    id: crypto.randomUUID(),
                    subclassId: created.id,
                    name: feature.name,
                    level: level + 1,
                    description: JSON.stringify(feature.entries || []),
                  };
                  await prisma.subclassFeature.create({ data: featureData });
                }
              }
            }
          }
        }
        console.log(`  ✓ ${classData.name} (${classData.subclasses.length} subclasses)`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error seeding class ${classData?.name}: ${error.message}`);
    }
  }

  console.log(`  ✓ ${count} classes seeded`);
  return { classIdMap, subclassIdMap };
}

async function seedSpells(classIdMap: Map<string, string>, subclassIdMap: Map<string, string>) {
  console.log('\n✨ Seeding Spells...');

  const spells = loadSpellsDir();
  console.log(`  Found ${spells.length} spells to migrate`);

  let count = 0;
  let classLinkCount = 0;
  let skipCount = 0;

  for (const spell of spells) {
    if (!spell.name) {
      skipCount++;
      continue;
    }

    const data = transformSpell(spell);
    if (!data) {
      skipCount++;
      continue;
    }

    try {
      const created = await prisma.spell.upsert({
        where: { name_source: { name: spell.name, source: spell.source || 'Unknown' } },
        update: data,
        create: data,
      });
      count++;

      const spellId = created.id;

      // Create spell-class links
      if (spell.classes) {
        // From class list — direct class spells
        if (spell.classes.fromClassList) {
          for (const classRef of spell.classes.fromClassList) {
            const classId = classIdMap.get(classRef.name);
            if (!classId) continue;
            try {
              await prisma.spellClass.create({
                data: { id: crypto.randomUUID(), spellId, classId, fromSubclass: false },
              });
              classLinkCount++;
            } catch {
              // skip duplicate
            }
          }
        }

        // From subclass — spells granted by a specific subclass
        if (spell.classes.fromSubclass) {
          for (const subclassRef of spell.classes.fromSubclass) {
            const className = subclassRef.class?.name;
            const subclassName = subclassRef.subclass?.name;
            if (!className) continue;
            const classId = classIdMap.get(className);
            if (!classId) continue;
            const subclassId = subclassName
              ? subclassIdMap.get(`${className}|${subclassName}`)
              : undefined;
            try {
              await prisma.spellClass.create({
                data: { id: crypto.randomUUID(), spellId, classId, fromSubclass: true, subclassId },
              });
              classLinkCount++;
            } catch {
              // skip duplicate
            }
          }
        }
      }
    } catch (error: any) {
      if (skipCount < 5) {
        console.error(`  ✗ Error seeding spell ${spell.name}: ${error.message}`);
      }
      skipCount++;
    }

    if (count % 200 === 0 && count > 0) {
      console.log(`  Processed ${count}/${spells.length} spells...`);
    }
  }

  console.log(`  ✓ ${count} spells seeded (${skipCount} skipped)`);
  console.log(`  ✓ ${classLinkCount} spell-class links created`);
}

async function seedConditions() {
  console.log('\n😵 Seeding Conditions...');
  
  const conditionsData = loadJson<{ condition: any[] }>('conditions.json');
  
  let count = 0;
  for (const condition of conditionsData.condition) {
    const data = transformCondition(condition);
    await prisma.condition.upsert({
      where: { name: condition.name },
      update: data,
      create: data,
    });
    count++;
  }
  
  console.log(`  ✓ ${count} conditions seeded`);
}

async function seedBackgrounds() {
  console.log('\n🎒 Seeding Backgrounds...');
  
  const backgroundsData = loadJson<{ background: any[] }>('backgrounds.json');
  
  let count = 0;
  for (const background of backgroundsData.background) {
    const data = transformBackground(background);
    await prisma.background.upsert({
      where: { name: background.name },
      update: data,
      create: data,
    });
    count++;
  }
  
  console.log(`  ✓ ${count} backgrounds seeded`);
}

async function seedFeats() {
  console.log('\n💪 Seeding Feats...');
  
  const featsData = loadJson<{ feat: any[] }>('feats.json');
  
  let count = 0;
  for (const feat of featsData.feat) {
    const data = transformFeat(feat);
    await prisma.feat.upsert({
      where: { name: feat.name },
      update: data,
      create: data,
    });
    count++;
  }
  
  console.log(`  ✓ ${count} feats seeded`);
}

async function seedDeities() {
  console.log('\n🛐 Seeding Deities...');
  
  const deitiesData = loadJson<{ deity: any[] }>('deities.json');
  
  let count = 0;
  for (const deity of deitiesData.deity) {
    const data = transformDeity(deity);
    await prisma.deity.create({ data }).catch(() => {
      // Skip duplicates
    });
    count++;
  }
  
  console.log(`  ✓ ${count} deities seeded`);
}

async function seedMonsters() {
  console.log('\n👹 Seeding Monsters...');
  
  const monsters = loadMonstersDir();
  console.log(`  Found ${monsters.length} monsters to migrate`);

  // Spell lookup for linking spellcasting monsters (first source wins on name collisions)
  const allSpells = await prisma.spell.findMany({ select: { id: true, name: true } });
  const spellIdByName = new Map<string, string>();
  for (const spell of allSpells) {
    const key = spell.name.toLowerCase();
    if (!spellIdByName.has(key)) spellIdByName.set(key, spell.id);
  }

  let count = 0;
  let traitCount = 0;
  let actionCount = 0;
  let spellLinkCount = 0;

  for (const monster of monsters) {
    try {
      const data = transformMonster(monster);
      
      const created = await prisma.monster.upsert({
        where: { name_source: { name: monster.name, source: monster.source } },
        update: data,
        create: data,
      });
      count++;

      // Clear existing traits/actions/spells so re-runs don't duplicate
      await prisma.monsterTrait.deleteMany({ where: { monsterId: created.id } });
      await prisma.monsterAction.deleteMany({ where: { monsterId: created.id } });
      await prisma.monsterSpell.deleteMany({ where: { monsterId: created.id } });

      // Create traits
      if (monster.trait && Array.isArray(monster.trait)) {
        for (const trait of monster.trait) {
          await prisma.monsterTrait.create({ data: transformMonsterTrait(trait, created.id) });
          traitCount++;
        }
      }

      // Create spellcasting as traits + link known spells
      if (monster.spellcasting && Array.isArray(monster.spellcasting)) {
        for (const sc of monster.spellcasting) {
          await prisma.monsterTrait.create({ data: transformMonsterSpellcasting(sc, created.id) });
          traitCount++;
        }

        const spellIds = extractSpellReferences(monster.spellcasting)
          .map((name) => spellIdByName.get(name))
          .filter((id): id is string => !!id);
        if (spellIds.length > 0) {
          await prisma.monsterSpell.createMany({
            data: spellIds.map((spellId) => ({ monsterId: created.id, spellId })),
            skipDuplicates: true,
          });
          spellLinkCount += spellIds.length;
        }
      }

      // Create actions
      if (monster.action && Array.isArray(monster.action)) {
        for (const action of monster.action) {
          await prisma.monsterAction.create({ data: transformMonsterAction(action, created.id) });
          actionCount++;
        }
      }

      // Create reactions
      if (monster.reaction && Array.isArray(monster.reaction)) {
        for (const reaction of monster.reaction) {
          await prisma.monsterAction.create({ data: transformMonsterAction({ ...reaction, type: 'reaction' }, created.id) });
          actionCount++;
        }
      }

      // Create legendary actions
      if (monster.legendary && Array.isArray(monster.legendary)) {
        for (const legendary of monster.legendary) {
          await prisma.monsterAction.create({ data: transformMonsterAction({ ...legendary, type: 'legendary' }, created.id) });
          actionCount++;
        }
      }
    } catch (error) {
      console.error(`  ✗ Error seeding monster ${monster.name}:`, error);
    }
    
    if (count % 100 === 0) {
      console.log(`  Processed ${count}/${monsters.length} monsters...`);
    }
  }
  
  console.log(`  ✓ ${count} monsters seeded`);
  console.log(`  ✓ ${traitCount} traits created`);
  console.log(`  ✓ ${actionCount} actions created`);
  console.log(`  ✓ ${spellLinkCount} monster-spell links created`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('🎲 D&D TOOLKIT - FULL DATA MIGRATION');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  try {
    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await clearAllTables();
    
    // Seed in dependency order
    await seedBooks();
    await seedLanguages();
    await seedAbilityScores();
    await seedAlignments();
    await seedSchoolsOfMagic();
    await seedDamageTypes();
    
    await seedRaces();
    const { classIdMap, subclassIdMap } = await seedClasses();

    await seedSpells(classIdMap, subclassIdMap);
    await seedConditions();
    await seedBackgrounds();
    await seedFeats();
    await seedDeities();
    await seedItems();
    await seedMonsters();
    await seedAdventures();

    // Print final stats
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION COMPLETE - FINAL STATS');
    console.log('='.repeat(60));
    
    const stats = await getStats();
    for (const [table, count] of Object.entries(stats)) {
      if (count > 0) {
        console.log(`  ${table}: ${count}`);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️ Total time: ${duration} seconds`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
