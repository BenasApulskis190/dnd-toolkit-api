import prisma from './prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

export const DATA_DIR = join(__dirname, '../../database/data');

export function loadJson<T>(filename: string): T {
  const filepath = join(DATA_DIR, filename);
  const content = readFileSync(filepath, 'utf-8');
  // Remove BOM if present
  const cleaned = content.replace(/^\uFEFF/, '');
  return JSON.parse(cleaned) as T;
}

export function loadSpellsDir(): any[] {
  const spells: any[] = [];
  
  const files = [
    'spells/spells-phb.json',
    'spells/spells-scag.json',
    'spells/spells-ua-mm.json',
    'spells/spells-ua-ss.json',
    'spells/spells-ua-tobm.json',
    'spells/spells-xge.json',
  ];

  for (const file of files) {
    const data = loadJson<{ spell: any[] }>(file);
    if (data.spell) {
      spells.push(...data.spell);
    }
  }

  return spells;
}

export function loadMonstersDir(): any[] {
  const monsters: any[] = [];
  
  const files = [
    'bestiary/bestiary-3pp-al.json',
    'bestiary/bestiary-3pp-cc.json',
    'bestiary/bestiary-3pp-fef.json',
    'bestiary/bestiary-3pp-gdof.json',
    'bestiary/bestiary-3pp-tob.json',
    'bestiary/bestiary-cos.json',
    'bestiary/bestiary-dmg.json',
    'bestiary/bestiary-hotdq.json',
    'bestiary/bestiary-lmop.json',
    'bestiary/bestiary-mag.json',
    'bestiary/bestiary-mm.json',
    'bestiary/bestiary-mtf.json',
    'bestiary/bestiary-oota.json',
    'bestiary/bestiary-phb.json',
    'bestiary/bestiary-pota.json',
    'bestiary/bestiary-ps-a.json',
    'bestiary/bestiary-ps-i.json',
    'bestiary/bestiary-ps-k.json',
    'bestiary/bestiary-ps-x.json',
    'bestiary/bestiary-ps-z.json',
    'bestiary/bestiary-rot.json',
    'bestiary/bestiary-skt.json',
    'bestiary/bestiary-tftyp.json',
    'bestiary/bestiary-toa.json',
    'bestiary/bestiary-ttp.json',
    'bestiary/bestiary-vgm.json',
    'bestiary/bestiary-xge.json',
  ];

  for (const file of files) {
    const data = loadJson<{ monster: any[] }>(file);
    if (data.monster) {
      monsters.push(...data.monster);
    }
  }

  return monsters;
}

export async function clearTable(model: keyof typeof prisma) {
  try {
    await (prisma[model] as any).deleteMany({});
    console.log(`  ✓ Cleared ${String(model)}`);
  } catch (error) {
    console.error(`  ✗ Error clearing ${String(model)}:`, error);
  }
}

export async function clearAllTables() {
  const tables = [
    'npc',
    'adventureSection',
    'adventure',
    'encounterMonster',
    'encounter',
    'characterItem',
    'characterFeature',
    'characterSpell',
    'character',
    'party',
    'monsterAction',
    'monsterTrait',
    'monster',
    'monsterType',
    'item',
    'deity',
    'feat',
    'backgroundLanguage',
    'background',
    'condition',
    'spellClass',
    'spell',
    'subclassFeature',
    'subclass',
    'classFeature',
    'class',
    'subrace',
    'raceLanguage',
    'race',
    'skill',
    'schoolOfMagic',
    'damageType',
    'alignment',
    'abilityScore',
    'language',
    'book',
  ];

  for (const table of tables) {
    await clearTable(table as keyof typeof prisma);
  }
}

export async function getStats() {
  const stats: Record<string, number> = {};
  
  const tables = [
    'book',
    'language',
    'abilityScore',
    'alignment',
    'damageType',
    'schoolOfMagic',
    'skill',
    'race',
    'subrace',
    'class',
    'classFeature',
    'subclass',
    'subclassFeature',
    'spell',
    'spellClass',
    'condition',
    'background',
    'backgroundLanguage',
    'feat',
    'deity',
    'item',
    'monster',
    'monsterTrait',
    'monsterAction',
    'adventure',
    'adventureSection',
    'npc',
  ];

  for (const table of tables) {
    const count = await (prisma[table as keyof typeof prisma] as any).count();
    stats[table] = count;
  }

  return stats;
}

export function uuidv4(): string {
  return crypto.randomUUID();
}

export async function batchCreate<T>(
  model: keyof typeof prisma,
  data: T[],
  batchSize: number = 100,
  uniqueFields?: (keyof T)[]
) {
  const results = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      if (uniqueFields && (prisma[model] as any).createMany) {
        await (prisma[model] as any).createMany({
          data: batch,
          skipDuplicates: true,
        });
      } else {
        for (const item of batch) {
          await (prisma[model] as any).create({ data: item });
        }
      }
      
      results.push(...batch);
      
      if ((i + batchSize) % 500 === 0 || i + batchSize >= data.length) {
        console.log(`  ✓ ${String(model)}: ${Math.min(i + batchSize, data.length)}/${data.length}`);
      }
    } catch (error) {
      console.error(`  ✗ Error in batch ${i}:`, error);
    }
  }
  
  return results;
}
