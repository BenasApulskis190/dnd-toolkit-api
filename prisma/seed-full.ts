import prisma from '../src/lib/prisma';
import {
  loadJson,
  loadSpellsDir,
  loadMonstersDir,
  clearAllTables,
  getStats,
} from '../src/lib/migration';
import {
  transformRace,
  transformSubrace,
  transformClass,
  transformClassFeature,
  transformSubclass,
  transformSubclassFeature,
  transformSpell,
  transformCondition,
  transformBackground,
  transformFeat,
  transformDeity,
  transformItem,
  transformMonster,
  transformMonsterTrait,
  transformMonsterSpellcasting,
  transformMonsterAction,
} from '../src/lib/transformers';

const SKIP_TABLES = [
  'character', 'characterSpell', 'characterFeature', 'characterItem',
  'party', 'encounter', 'encounterMonster'
];

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
  return classIdMap;
}

async function seedSpells(classIdMap: Map<string, string>) {
  console.log('\n✨ Seeding Spells...');
  
  const spells = loadSpellsDir();
  console.log(`  Found ${spells.length} spells to migrate`);
  
  const spellIdMap = new Map<string, string>();
  let count = 0;
  let classLinkCount = 0;
  let skipCount = 0;
  
  for (const spell of spells) {
    if (!spell.name) {
      skipCount++;
      continue;
    }
    
    const spellId = crypto.randomUUID();
    spellIdMap.set(`${spell.name}|${spell.source}`, spellId);
    
    const data = transformSpell(spell);
    if (!data) {
      skipCount++;
      continue;
    }
    
    try {
      await prisma.spell.upsert({
        where: { name_source: { name: spell.name, source: spell.source || 'Unknown' } },
        update: data,
        create: data,
      });
      count++;
      
      // Create spell-class links
      if (spell.classes) {
        // From class list
        if (spell.classes.fromClassList) {
          for (const classRef of spell.classes.fromClassList) {
            const classId = classIdMap.get(classRef.name);
            if (classId) {
              await prisma.spellClass.create({
                data: {
                  id: crypto.randomUUID(),
                  spellId,
                  classId,
                  fromSubclass: false,
                },
              });
              classLinkCount++;
            }
          }
        }
        
        // From subclass
        if (spell.classes.fromSubclass) {
          for (const subclassRef of spell.classes.fromSubclass) {
            const subclassClassName = subclassRef.class?.name;
            if (subclassClassName) {
              const classId = classIdMap.get(subclassClassName);
              if (classId) {
                await prisma.spellClass.create({
                  data: {
                    id: crypto.randomUUID(),
                    spellId,
                    classId,
                    fromSubclass: true,
                  },
                });
                classLinkCount++;
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (count < 5) {
        console.error(`  ✗ Error seeding spell ${spell.name}: ${error.message}`);
      }
    }
    
    if (count % 200 === 0) {
      console.log(`  Processed ${count}/${spells.length} spells...`);
    }
  }
  
  console.log(`  ✓ ${count} spells seeded (${skipCount} skipped)`);
  console.log(`  ✓ ${classLinkCount} spell-class links created`);
  return spellIdMap;
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

async function seedItems() {
  console.log('\n🎒 Seeding Items...');
  
  const itemsData = loadJson<{ item: any[] }>('items.json');
  
  let count = 0;
  let skipCount = 0;
  
  for (const item of itemsData.item) {
    const data = transformItem(item);
    try {
      await prisma.item.create({ data });
      count++;
    } catch (error) {
      skipCount++;
    }
    
    if (count % 100 === 0) {
      console.log(`  Processed ${count}/${itemsData.item.length} items...`);
    }
  }
  
  console.log(`  ✓ ${count} items seeded (${skipCount} skipped)`);
}

async function seedMonsters() {
  console.log('\n👹 Seeding Monsters...');
  
  const monsters = loadMonstersDir();
  console.log(`  Found ${monsters.length} monsters to migrate`);
  
  let count = 0;
  let traitCount = 0;
  let actionCount = 0;
  
  for (const monster of monsters) {
    try {
      const data = transformMonster(monster);
      
      const created = await prisma.monster.upsert({
        where: { name_source: { name: monster.name, source: monster.source } },
        update: data,
        create: data,
      });
      count++;

      // Clear existing traits/actions so re-runs don't duplicate
      await prisma.monsterTrait.deleteMany({ where: { monsterId: created.id } });
      await prisma.monsterAction.deleteMany({ where: { monsterId: created.id } });

      // Create traits
      if (monster.trait && Array.isArray(monster.trait)) {
        for (const trait of monster.trait) {
          await prisma.monsterTrait.create({ data: transformMonsterTrait(trait, created.id) });
          traitCount++;
        }
      }

      // Create spellcasting as traits
      if (monster.spellcasting && Array.isArray(monster.spellcasting)) {
        for (const sc of monster.spellcasting) {
          await prisma.monsterTrait.create({ data: transformMonsterSpellcasting(sc, created.id) });
          traitCount++;
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
    
    const raceIdMap = await seedRaces();
    const classIdMap = await seedClasses();
    
    await seedSpells(classIdMap);
    await seedConditions();
    await seedBackgrounds();
    await seedFeats();
    await seedDeities();
    await seedItems();
    await seedMonsters();
    
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
