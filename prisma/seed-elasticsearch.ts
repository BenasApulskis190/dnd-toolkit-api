import prisma from '../src/lib/prisma';
import { bulkIndex, deleteIndex, INDICES } from '../src/lib/elasticsearch';

async function indexRaces() {
  console.log('📚 Indexing races...');
  const races = await prisma.race.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      size: true,
      speed: true,
      darkvision: true,
      strBonus: true,
      dexBonus: true,
      conBonus: true,
      intBonus: true,
      wisBonus: true,
      chaBonus: true,
      description: true,
    },
  });
  
  const documents = races.map((race) => ({
    ...race,
    speed: race.speed || 30,
  }));
  
  await bulkIndex(INDICES.races, documents);
  console.log(`  ✓ ${documents.length} races indexed`);
}

async function indexClasses() {
  console.log('🎭 Indexing classes...');
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      hitDie: true,
      description: true,
    },
  });
  
  await bulkIndex(INDICES.classes, classes);
  console.log(`  ✓ ${classes.length} classes indexed`);
}

async function indexSpells() {
  console.log('✨ Indexing spells...');
  const spells = await prisma.spell.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      level: true,
      school: true,
      castingTime: true,
      range: true,
      duration: true,
      concentration: true,
      ritual: true,
      description: true,
      damageType: true,
      savingThrow: true,
    },
  });
  
  // Get spell classes for filtering
  const spellClasses = await prisma.spellClass.findMany({
    select: {
      spellId: true,
      classId: true,
    },
  });
  
  const classMap = new Map<string, string[]>();
  for (const sc of spellClasses) {
    if (!classMap.has(sc.spellId)) {
      classMap.set(sc.spellId, []);
    }
    classMap.get(sc.spellId)!.push(sc.classId);
  }
  
  const documents = spells.map((spell) => ({
    ...spell,
    classes: classMap.get(spell.id) || [],
  }));
  
  await bulkIndex(INDICES.spells, documents);
  console.log(`  ✓ ${documents.length} spells indexed`);
}

async function indexMonsters() {
  console.log('👹 Indexing monsters...');
  const monsters = await prisma.monster.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      size: true,
      alignment: true,
      challengeRating: true,
      crValue: true,
      hitPointsAvg: true,
      armorClass: true,
      strScore: true,
      dexScore: true,
      conScore: true,
      intScore: true,
      wisScore: true,
      chaScore: true,
      speedWalk: true,
      languages: true,
      monsterType: { select: { name: true } },
    },
  });

  const documents = monsters.map((monster) => ({
    ...monster,
    type: monster.monsterType?.name,
    cr: monster.challengeRating,
    hp: monster.hitPointsAvg,
    ac: monster.armorClass,
  }));
  
  await bulkIndex(INDICES.monsters, documents);
  console.log(`  ✓ ${documents.length} monsters indexed`);
}

async function indexItems() {
  console.log('🎒 Indexing items...');
  const items = await prisma.item.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      type: true,
      rarity: true,
      value: true,
      weight: true,
      attunement: true,
      description: true,
    },
  });
  
  await bulkIndex(INDICES.items, items);
  console.log(`  ✓ ${items.length} items indexed`);
}

async function indexBackgrounds() {
  console.log('🎒 Indexing backgrounds...');
  const backgrounds = await prisma.background.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      skillProficiencies: true,
      featureName: true,
      featureDescription: true,
    },
  });
  
  await bulkIndex(INDICES.backgrounds, backgrounds);
  console.log(`  ✓ ${backgrounds.length} backgrounds indexed`);
}

async function indexFeats() {
  console.log('💪 Indexing feats...');
  const feats = await prisma.feat.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      prerequisite: true,
      description: true,
    },
  });
  
  await bulkIndex(INDICES.feats, feats);
  console.log(`  ✓ ${feats.length} feats indexed`);
}

async function indexConditions() {
  console.log('😵 Indexing conditions...');
  const conditions = await prisma.condition.findMany({
    select: {
      id: true,
      name: true,
      source: true,
      description: true,
    },
  });
  
  await bulkIndex(INDICES.conditions, conditions);
  console.log(`  ✓ ${conditions.length} conditions indexed`);
}

async function main() {
  const args = process.argv.slice(2);
  const indexOnly = args[0]; // e.g., "backgrounds", "feats", etc.
  
  console.log('='.repeat(50));
  console.log('🔍 ELASTICSEARCH INDEXING');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Delete indices that are about to be re-built so stale documents don't linger
    const indicesToRebuild = Object.entries(INDICES)
      .filter(([key]) => !indexOnly || indexOnly === key)
      .map(([, value]) => value);
    for (const index of indicesToRebuild) {
      await deleteIndex(index);
    }

    if (!indexOnly || indexOnly === 'races') await indexRaces();
    if (!indexOnly || indexOnly === 'classes') await indexClasses();
    if (!indexOnly || indexOnly === 'spells') await indexSpells();
    if (!indexOnly || indexOnly === 'monsters') await indexMonsters();
    if (!indexOnly || indexOnly === 'items') await indexItems();
    if (!indexOnly || indexOnly === 'backgrounds') await indexBackgrounds();
    if (!indexOnly || indexOnly === 'feats') await indexFeats();
    if (!indexOnly || indexOnly === 'conditions') await indexConditions();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ INDEXING COMPLETE');
    console.log(`⏱️ Time: ${duration} seconds`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Indexing failed:', error);
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
