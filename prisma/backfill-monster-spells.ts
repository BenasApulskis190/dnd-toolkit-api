import prisma from '../src/lib/prisma';
import { loadMonstersDir } from '../src/lib/migration';
import { extractSpellReferences } from '../src/lib/transformers';

// One-off backfill: links existing monster rows to spells parsed from the raw
// bestiary JSON, matching monsters by [name, source] so no UUIDs change.
async function main() {
  const monsters = loadMonstersDir();

  const allSpells = await prisma.spell.findMany({ select: { id: true, name: true } });
  const spellIdByName = new Map<string, string>();
  for (const spell of allSpells) {
    const key = spell.name.toLowerCase();
    if (!spellIdByName.has(key)) spellIdByName.set(key, spell.id);
  }

  let linkedMonsters = 0;
  let linkCount = 0;
  const unmatched = new Set<string>();

  for (const monster of monsters) {
    if (!monster.spellcasting || !Array.isArray(monster.spellcasting)) continue;

    const existing = await prisma.monster.findUnique({
      where: { name_source: { name: monster.name, source: monster.source } },
      select: { id: true },
    });
    if (!existing) continue;

    const names = extractSpellReferences(monster.spellcasting);
    const spellIds: string[] = [];
    for (const name of names) {
      const id = spellIdByName.get(name);
      if (id) spellIds.push(id);
      else unmatched.add(name);
    }

    await prisma.monsterSpell.deleteMany({ where: { monsterId: existing.id } });
    if (spellIds.length > 0) {
      await prisma.monsterSpell.createMany({
        data: spellIds.map((spellId) => ({ monsterId: existing.id, spellId })),
        skipDuplicates: true,
      });
      linkedMonsters++;
      linkCount += spellIds.length;
    }
  }

  console.log(`✓ ${linkCount} spell links created for ${linkedMonsters} monsters`);
  if (unmatched.size > 0) {
    console.log(`⚠ ${unmatched.size} spell names had no match in the spell table:`);
    console.log(`  ${[...unmatched].sort().join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
