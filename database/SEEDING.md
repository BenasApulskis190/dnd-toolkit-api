# Database Seeding Guide

## Overview

This guide explains how to seed your PostgreSQL database with the D&D data from the JSON files.

## Seeding Order

Follow this order to ensure all foreign key relationships are satisfied:

1. Lookup Tables (already seeded in schema.sql)
2. Books/Sources
3. Races → Subraces
4. Classes → Class Features → Subclasses → Subclass Features
5. Spells → Spell Classes
6. Conditions
7. Backgrounds
8. Feats
9. Deities
10. Items
11. Monsters → Monster Traits → Monster Actions
12. User Content (Parties, Characters, Encounters)

## Quick Start

```bash
# Copy schema to database
docker exec -i postgres psql -U appuser -d dnndb < api/database/schema.sql

# Run seed script
docker exec -i postgres psql -U appuser -d dnndb < api/database/seed.sql
```

## JSON to Table Mapping

### races.json → race, subrace

```javascript
// races.json structure:
{
  "race": [
    {
      "name": "Elf",
      "source": "PHB",
      "page": 21,
      "size": "M",
      "speed": 30,
      "darkvision": 60,
      "ability": { "dex": 2 },
      "entries": [...],
      "subraces": [
        { "name": "High Elf", "ability": { "int": 1 }, ... }
      ]
    }
  ]
}

// Maps to:
// INSERT INTO race (name, source, page, size, speed, darkvision, dex_bonus)
// INSERT INTO subrace (race_id, name, int_bonus)
```

### classes.json → class, class_feature, subclass, subclass_feature

```javascript
// classes.json structure:
{
  "class": [
    {
      "name": "Wizard",
      "source": "PHB",
      "hd": { "number": 1, "faces": 6 },
      "proficiency": ["int", "wis"],
      "classFeatures": [
        [ // level 1 features
          { "name": "Arcane Recovery", "entries": [...] }
        ],
        [ // level 2 features
          { "name": "Abjuration Savant", ... }
        ]
      ],
      "subclasses": [
        {
          "name": "School of Evocation",
          "subclassFeatures": [...]
        }
      ]
    }
  ]
}
```

### spells/*.json → spell, spell_class

```javascript
// Spell structure:
{
  "name": "Fireball",
  "level": 3,
  "school": "E",
  "time": [{ "number": 1, "unit": "action" }],
  "range": { "type": "point", "distance": { "type": "feet", "amount": 150 } },
  "components": { "v": true, "s": true, "m": "a tiny ball of bat guano and sulfur" },
  "duration": [{ "type": "instant" }],
  "classes": {
    "fromClassList": [
      { "name": "Wizard", "source": "PHB" }
    ]
  },
  "entries": [...],
  "entriesHigherLevel": [...]
}
```

### bestiary/*.json → monster, monster_trait, monster_action

```javascript
// Monster structure:
{
  "name": "Goblin",
  "size": "S",
  "type": { "type": "humanoid", "tags": ["goblinoid"] },
  "source": "MM",
  "alignment": ["N", "E"],
  "ac": "15",
  "hp": { "average": 7, "formula": "2d6" },
  "speed": { "walk": 30 },
  "str": 8, "dex": 14, "con": 10, "int": 10, "wis": 8, "cha": 8,
  "cr": "1/4",
  "trait": [
    { "name": "Nimble Escape", "entries": [...] }
  ],
  "action": [
    { "name": "Scimitar", "entries": [...] }
  ]
}
```

## Sample Seed Script (seed.sql)

```sql
-- ============================================================================
-- SEED DATA: Core Content
-- ============================================================================

-- Sample Race (simplified)
INSERT INTO race (name, source, size, speed, dex_bonus, description) VALUES
('Human', 'PHB', 'M', 30, 0, 
  '{"type": "entries", "entries": ["Your base walking speed is 30 feet.", "Your size is Medium."]}'),
('Elf', 'PHB', 'M', 30, 2,
  '{"type": "entries", "entries": ["Your base walking speed is 30 feet.", "Darkvision: 60 feet."]}'),
('Dwarf', 'PHB', 'M', 25, 0,
  '{"type": "entries", "entries": ["Your base walking speed is 25 feet.", "Darkvision: 60 feet.", "Poison Resistance"]}')
ON CONFLICT (name, source) DO UPDATE SET
  dex_bonus = EXCLUDED.dex_bonus;

-- Sample Class
INSERT INTO class (name, source, hit_die, proficiency_int, proficiency_wis) VALUES
('Wizard', 'PHB', 6, TRUE, TRUE),
('Fighter', 'PHB', 10, FALSE, FALSE),
('Rogue', 'PHB', 8, FALSE, FALSE),
('Cleric', 'PHB', 8, FALSE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Sample Spells
INSERT INTO spell (name, source, level, school, casting_time, range, components, duration, description) VALUES
('Fireball', 'PHB', 3, 'Evocation', 
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 150}}',
  '{"v": true, "s": true, "m": "a tiny ball of bat guano and sulfur"}',
  '{"type": "instant"}',
  '{"type": "entries", "entries": ["A bright streak flashes from your pointing finger to a point you choose within range..."]}')
ON CONFLICT DO NOTHING;

-- Sample Monster
INSERT INTO monster (name, source, size, type, armor_class, hit_points_avg, hit_points_formula, 
  str_score, dex_score, con_score, int_score, wis_score, cha_score, challenge_rating, cr_value) VALUES
('Goblin', 'MM', 'S', 'humanoid', 15, 7, '2d6', 8, 14, 10, 10, 8, 8, '1/4', 0.25),
('Dragon, Adult Red', 'MM', 'H', 'dragon', 19, 256, '17d12+119', 27, 10, 25, 16, 15, 23, '17', 17.0)
ON CONFLICT (name, source) DO NOTHING;

-- Sample Character
INSERT INTO "character" (name, player_name, level, max_hp, current_hp, str_score, dex_score, 
  con_score, int_score, wis_score, cha_score) VALUES
('Virex the Cataclysm', 'Tomas', 5, 40, 40, 9, 14, 14, 17, 11, 16),
('Fizz', 'Arturas', 5, 32, 32, 10, 16, 12, 11, 9, 15)
ON CONFLICT DO NOTHING;

-- Get character IDs and update with race/class
UPDATE "character" SET 
  race_id = (SELECT id FROM race WHERE name = 'Fire Genasi'),
  class_id = (SELECT id FROM class WHERE name = 'Wizard')
WHERE name = 'Virex the Cataclysm';

-- Sample Encounter
INSERT INTO encounter (name, difficulty, party_level) VALUES
('Goblin Ambush', 'medium', 5),
('Dragon''s Lair', 'deadly', 17)
ON CONFLICT DO NOTHING;

-- Sample Encounter Monsters
INSERT INTO encounter_monster (encounter_id, monster_id, quantity) 
SELECT e.id, m.id, 4
FROM encounter e, monster m
WHERE e.name = 'Goblin Ambush' AND m.name = 'Goblin'
ON CONFLICT DO NOTHING;
```

## TypeScript Seeding Script (Recommended)

Create `api/src/database/seed.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  
  try {
    // Seed races
    const racesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../client/src/data/races.json'), 'utf-8')
    );
    
    for (const race of racesData.race) {
      await client.query(
        `INSERT INTO race (name, source, size, speed, darkvision, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name, source) DO UPDATE SET
           size = EXCLUDED.size,
           speed = EXCLUDED.speed`,
        [race.name, race.source, race.size, race.speed?.walk || race.speed || 30, 
         race.darkvision, JSON.stringify(race.entries)]
      );
      
      // Seed subraces
      if (race.subraces) {
        const raceRow = await client.query(
          'SELECT id FROM race WHERE name = $1 AND source = $2',
          [race.name, race.source]
        );
        
        for (const subrace of race.subraces) {
          await client.query(
            `INSERT INTO subrace (race_id, name, ability_bonuses)
             VALUES ($1, $2, $3)`,
            [raceRow.rows[0].id, subrace.name, JSON.stringify(subrace.ability)]
          );
        }
      }
    }
    
    console.log('Seeding completed!');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
```

## Run Seeding

```bash
# From inside the API container
docker-compose exec api npm run seed

# Or directly with tsx
docker-compose exec api npx tsx src/database/seed.ts
```

## Verify Seeding

```sql
-- Check record counts
SELECT 'races' as table_name, COUNT(*) as count FROM race
UNION ALL SELECT 'classes', COUNT(*) FROM class
UNION ALL SELECT 'spells', COUNT(*) FROM spell
UNION ALL SELECT 'monsters', COUNT(*) FROM monster
UNION ALL SELECT 'items', COUNT(*) FROM item
UNION ALL SELECT 'conditions', COUNT(*) FROM condition;
```

## Reset Database

```bash
# Drop all tables and re-run schema + seed
docker exec postgres psql -U appuser -d dnndb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i postgres psql -U appuser -d dnndb < api/database/schema.sql
docker exec -i postgres psql -U appuser -d dnndb < api/database/seed.sql
```
