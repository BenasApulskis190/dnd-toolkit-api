import prisma from '../src/lib/prisma';
import { loadMonstersDir } from '../src/lib/migration';

// One-off backfill: fills in damage resistances/immunities/vulnerabilities,
// condition immunities and burrow speed for existing monster rows, matching
// by [name, source] so no UUIDs (and downstream FKs) change.
async function main() {
  const monsters = loadMonstersDir();

  let updated = 0;
  let unmatched = 0;

  for (const monster of monsters) {
    const speedBurrow =
      typeof monster.speed === 'object' && monster.speed !== null
        ? (typeof monster.speed.burrow === 'number'
            ? monster.speed.burrow
            : monster.speed.burrow?.number ?? undefined)
        : undefined;

    const data = {
      damageVulnerabilities: monster.vulnerable ? JSON.stringify(monster.vulnerable) : null,
      damageResistances: monster.resist ? JSON.stringify(monster.resist) : null,
      damageImmunities: monster.immune ? JSON.stringify(monster.immune) : null,
      conditionImmunities: monster.conditionImmune ? JSON.stringify(monster.conditionImmune) : null,
      speedBurrow: speedBurrow ?? null,
    };

    const result = await prisma.monster.updateMany({
      where: { name: monster.name, source: monster.source },
      data,
    });

    if (result.count > 0) updated += result.count;
    else unmatched++;
  }

  console.log(`✓ ${updated} monsters updated with defenses/senses data`);
  if (unmatched > 0) {
    console.log(`⚠ ${unmatched} entries from raw data had no matching monster row`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
