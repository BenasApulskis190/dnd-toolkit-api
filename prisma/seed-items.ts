import prisma from '../src/lib/prisma';
import { loadJson } from '../src/lib/migration';
import { transformItem } from '../src/lib/transformers';

export async function seedItems() {
  console.log('\n🎒 Seeding Items...');

  const itemsData = loadJson<{ item: any[] }>('items.json');

  // Replace non-custom items so re-runs pick up transformer changes
  await prisma.item.deleteMany({ where: { isCustom: false } });

  let count = 0;
  let skipCount = 0;

  for (const item of itemsData.item) {
    const data = transformItem(item);
    try {
      await prisma.item.create({ data });
      count++;
    } catch {
      skipCount++;
    }

    if (count % 100 === 0) {
      console.log(`  Processed ${count}/${itemsData.item.length} items...`);
    }
  }

  console.log(`  ✓ ${count} items seeded (${skipCount} skipped)`);
}

if (require.main === module) {
  seedItems()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Item seeding failed:', error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
