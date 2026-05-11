-- D&D Toolkit Seed Data
-- Run after schema.sql

-- ============================================================================
-- SAMPLE SEED DATA
-- This contains representative data from your JSON files.
-- For full seeding, use the TypeScript seed script.
-- ============================================================================

-- Books/Sources
INSERT INTO book (code, name, type) VALUES
('PHB', 'Player''s Handbook', 'core'),
('MM', 'Monster Manual', 'core'),
('DMG', 'Dungeon Master''s Guide', 'core'),
('XGE', 'Xanathar''s Guide to Everything', 'expansion'),
('EEPC', 'Elemental Evil Player''s Companion', 'expansion'),
('VGM', 'Volo''s Guide to Monsters', 'expansion'),
('MTF', 'Mordenkainen''s Tome of Foes', 'expansion'),
('SCAG', 'Sword Coast Adventurer''s Guide', 'expansion')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- RACES
-- ============================================================================

-- Core Races
INSERT INTO race (name, source, size, speed, darkvision, str_bonus, dex_bonus, con_bonus, int_bonus, wis_bonus, cha_bonus) VALUES
('Human', 'PHB', 'M', 30, NULL, 1, 1, 1, 1, 1, 1),
('Elf', 'PHB', 'M', 30, 60, NULL, 2, NULL, NULL, NULL, NULL),
('Dwarf', 'PHB', 'M', 25, 60, NULL, NULL, 2, NULL, NULL, NULL),
('Half-Elf', 'PHB', 'M', 30, 60, NULL, NULL, NULL, NULL, NULL, 2),
('Half-Orc', 'PHB', 'M', 30, 60, 2, NULL, 1, NULL, NULL, NULL),
('Gnome', 'PHB', 'S', 25, 60, NULL, NULL, NULL, 2, NULL, NULL),
('Halfling', 'PHB', 'S', 25, NULL, NULL, 2, NULL, NULL, NULL, NULL),
('Dragonborn', 'PHB', 'M', 30, NULL, 2, NULL, NULL, NULL, NULL, 1),
('Tiefling', 'PHB', 'M', 30, 60, NULL, NULL, NULL, 1, NULL, 2),
('Aarakocra', 'EEPC', 'M', 25, NULL, NULL, 2, NULL, NULL, 1, NULL),
('Genasi', 'EEPC', 'M', 30, NULL, NULL, NULL, 2, NULL, NULL, NULL),
('Goliath', 'EEPC', 'M', 30, NULL, 2, NULL, 1, NULL, NULL, NULL)
ON CONFLICT (name, source) DO NOTHING;

-- ============================================================================
-- CLASSES
-- ============================================================================

INSERT INTO class (name, source, hit_die, proficiency_str, proficiency_dex, proficiency_con, 
  proficiency_int, proficiency_wis, proficiency_cha, subclass_title) VALUES
('Barbarian', 'PHB', 12, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, 'Primal Path'),
('Bard', 'PHB', 8, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Bard College'),
('Cleric', 'PHB', 8, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Divine Domain'),
('Druid', 'PHB', 8, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Druid Circle'),
('Fighter', 'PHB', 10, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, 'Martial Archetype'),
('Monk', 'PHB', 8, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Monastic Tradition'),
('Paladin', 'PHB', 10, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Sacred Oath'),
('Ranger', 'PHB', 10, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ranger Conclave'),
('Rogue', 'PHB', 8, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Roguish Archetype'),
('Sorcerer', 'PHB', 6, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, 'Sorcerous Origin'),
('Warlock', 'PHB', 8, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Otherworldly Patron'),
('Wizard', 'PHB', 6, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Arcane Tradition')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SUBCLASSES
-- ============================================================================

-- Barbarian Subclasses
INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Path of the Berserker', 'Berserker', 'PHB' FROM class WHERE name = 'Barbarian'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Path of the Totem Warrior', 'Totem Warrior', 'PHB' FROM class WHERE name = 'Barbarian'
ON CONFLICT DO NOTHING;

-- Fighter Subclasses
INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Champion', 'Champion', 'PHB' FROM class WHERE name = 'Fighter'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Battle Master', 'Battle Master', 'PHB' FROM class WHERE name = 'Fighter'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Eldritch Knight', 'Eldritch Knight', 'PHB' FROM class WHERE name = 'Fighter'
ON CONFLICT DO NOTHING;

-- Wizard Subclasses
INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'School of Evocation', 'Evocation', 'PHB' FROM class WHERE name = 'Wizard'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'School of Abjuration', 'Abjuration', 'PHB' FROM class WHERE name = 'Wizard'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'School of Necromancy', 'Necromancy', 'PHB' FROM class WHERE name = 'Wizard'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'School of Transmutation', 'Transmutation', 'PHB' FROM class WHERE name = 'Wizard'
ON CONFLICT DO NOTHING;

-- Sorcerer Subclasses
INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Draconic Bloodline', 'Draconic', 'PHB' FROM class WHERE name = 'Sorcerer'
ON CONFLICT DO NOTHING;

INSERT INTO subclass (class_id, name, short_name, source)
SELECT id, 'Wild Magic', 'Wild Magic', 'PHB' FROM class WHERE name = 'Sorcerer'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CONDITIONS
-- ============================================================================

INSERT INTO condition (name, source, description, page) VALUES
('Blinded', 'PHB', '{"type": "list", "items": ["A blinded creature can''t see and automatically fails any ability check that requires sight.", "Attack rolls against the creature have advantage, and the creature''s attack rolls have disadvantage."]}', 290),
('Charmed', 'PHB', '{"type": "list", "items": ["A charmed creature can''t attack the charmer or target the charmer with harmful abilities or magical effects.", "The charmer has advantage on any ability check to interact socially with the creature."]}', 290),
('Deafened', 'PHB', '{"type": "list", "items": ["A deafened creature can''t hear and automatically fails any ability check that requires hearing."]}', 290),
('Frightened', 'PHB', '{"type": "list", "items": ["A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.", "The creature can''t willingly move closer to the source of its fear."]}', 290),
('Grappled', 'PHB', '{"type": "list", "items": ["A grappled creature''s speed becomes 0, and it can''t benefit from any bonus to its speed.", "The condition ends if the grappler is incapacitated.", "The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect."]}', 290),
('Incapacitated', 'PHB', '{"type": "list", "items": ["An incapacitated creature can''t take actions or reactions."]}', 290),
('Invisible', 'PHB', '{"type": "list", "items": ["An invisible creature is impossible to see without the aid of magic or a special sense.", "Attack rolls against the creature have disadvantage, and the creature''s attack rolls have advantage."]}', 291),
('Paralyzed', 'PHB', '{"type": "list", "items": ["A paralyzed creature is incapacitated and can''t move or speak.", "The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.", "Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."]}', 291),
('Petrified', 'PHB', '{"type": "list", "items": ["A petrified creature is transformed into a solid inanimate substance (usually stone). Its weight increases by a factor of ten.", "The creature is incapacitated, can''t move or speak, and is unaware of its surroundings.", "The creature has resistance to all damage.", "The creature is immune to poison and disease."]}', 291),
('Poisoned', 'PHB', '{"type": "list", "items": ["A poisoned creature has disadvantage on attack rolls and ability checks."]}', 292),
('Prone', 'PHB', '{"type": "list", "items": ["A prone creature''s only movement option is to crawl.", "The creature has disadvantage on attack rolls.", "An attack roll against the creature has advantage if the attacker is within 5 feet. Otherwise, the attack roll has disadvantage."]}', 292),
('Restrained', 'PHB', '{"type": "list", "items": ["A restrained creature''s speed becomes 0.", "Attack rolls against the creature have advantage, and the creature''s attack rolls have disadvantage.", "The creature has disadvantage on Dexterity saving throws."]}', 292),
('Stunned', 'PHB', '{"type": "list", "items": ["A stunned creature is incapacitated, can''t move, and can speak only falteringly.", "The creature automatically fails Strength and Dexterity saving throws.", "Attack rolls against the creature have advantage."]}', 292),
('Unconscious', 'PHB', '{"type": "list", "items": ["An unconscious creature is incapacitated, can''t move or speak, and is unaware of its surroundings.", "The creature drops whatever it''s holding and falls prone.", "The creature automatically fails Strength and Dexterity saving throws.", "Attack rolls against the creature have advantage."]}', 292)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE MONSTERS
-- ============================================================================

INSERT INTO monster (name, source, size, type, armor_class, hit_points_avg, hit_points_formula,
  speed_walk, str_score, dex_score, con_score, int_score, wis_score, cha_score,
  passive_perception, languages, challenge_rating, cr_value) VALUES
-- Humanoids
('Goblin', 'MM', 'S', 'humanoid', 15, 7, '2d6', 30, 8, 14, 10, 10, 8, 8, 9, 'Common, Goblin', '1/4', 0.25),
('Hobgoblin', 'MM', 'M', 'humanoid', 18, 11, '2d8+2', 30, 13, 12, 12, 10, 10, 9, 10, 'Common, Goblin', '1/2', 0.5),
('Orc', 'MM', 'M', 'humanoid', 13, 15, '2d8+6', 30, 16, 12, 16, 7, 11, 10, 10, 'Common, Orc', '1/2', 0.5),
('Ogre', 'MM', 'L', 'giant', 11, 59, '7d10+21', 40, 19, 8, 16, 5, 7, 7, 8, 'Common, Giant', '2', 2),
('Troll', 'MM', 'L', 'giant', 15, 84, '7d10+42', 30, 18, 13, 20, 7, 9, 7, 13, 'Common', '5', 5),

-- Undead
('Skeleton', 'MM', 'M', 'undead', 13, 13, '2d8+4', 30, 10, 14, 15, 6, 8, 5, 9, 'Understands languages it knew in life', '1/4', 0.25),
('Zombie', 'MM', 'M', 'undead', 8, 22, '3d8+9', 20, 13, 6, 16, 3, 6, 5, 8, 'Understands languages it knew in life', '1/4', 0.25),
('Wraith', 'MM', 'M', 'undead', 13, 67, '9d8+27', 0, 6, 16, 16, 12, 14, 15, 12, 'The languages it knew in life', '5', 5),
('Vampire', 'MM', 'M', 'undead', 16, 144, '18d8+72', 30, 18, 18, 18, 17, 15, 18, 15, 'The languages it knew in life', '13', 13),

-- Dragons
('Ancient Red Dragon', 'MM', 'G', 'dragon', 22, 546, '33d20+231', 40, 30, 10, 29, 18, 15, 23, 22, 'Common, Draconic', '24', 24),
('Adult Red Dragon', 'MM', 'H', 'dragon', 19, 256, '17d12+119', 40, 27, 10, 25, 16, 15, 23, 18, 'Common, Draconic', '17', 17),
('Young Red Dragon', 'MM', 'L', 'dragon', 18, 136, '16d10+48', 40, 23, 10, 21, 14, 11, 17, 14, 'Common, Draconic', '8', 8),
('Red Dragon Wyrmling', 'MM', 'M', 'dragon', 17, 45, '7d10+7', 30, 19, 10, 17, 12, 9, 15, 12, 'Common, Draconic', '4', 4),

-- Beasts
('Wolf', 'MM', 'M', 'beast', 13, 11, '2d8+2', 40, 12, 15, 12, 3, 12, 6, 13, '—', '1/4', 0.25),
('Giant Spider', 'MM', 'L', 'beast', 14, 26, '4d10+4', 30, 14, 16, 12, 2, 11, 4, 10, '—', '1', 1),
('Brown Bear', 'MM', 'L', 'beast', 11, 34, '4d10+12', 40, 19, 10, 19, 2, 13, 7, 13, '—', '1', 1),

-- Aberrations
('Mind Flayer', 'MM', 'M', 'aberration', 15, 71, '10d10+16', 30, 11, 12, 12, 19, 17, 17, 17, 'Deep Speech, telepathy 120 ft., Undercommon', '7', 7),
('Beholder', 'MM', 'L', 'aberration', 18, 180, '20d10+80', 0, 10, 14, 18, 17, 15, 17, 22, 'Deep Speech', '13', 13),

-- Constructs
('Animated Armor', 'MM', 'M', 'construct', 18, 33, '6d8+6', 25, 14, 9, 18, 1, 3, 1, 6, '—', '1', 1),
('Golem, Stone', 'MM', 'M', 'construct', 17, 178, '17d10+85', 20, 22, 8, 20, 3, 11, 1, 10, '—', '10', 10)
ON CONFLICT (name, source) DO NOTHING;

-- ============================================================================
-- SAMPLE SPELLS
-- ============================================================================

INSERT INTO spell (name, source, level, school, casting_time, range, components, duration, 
  concentration, description) VALUES
-- Cantrips (Level 0)
('Fire Bolt', 'PHB', 0, 'Evocation', 
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 120}}',
  '{"v": true, "s": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["You hurl a mote of fire at a creature or object within range."]}'),

('Light', 'PHB', 0, 'Evocation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "touch"}}',
  '{"v": true, "m": "a firefly or phosphorescent moss"}',
  '{"type": "timed", "duration": {"type": "hours", "amount": 1}}', FALSE,
  '{"type": "entries", "entries": ["You touch one object that is no larger than 10 feet in any dimension."]}'),

('Prestidigitation', 'PHB', 0, 'Transmutation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 10}}',
  '{"v": true, "s": true}',
  '{"type": "timed", "duration": {"type": "hours", "amount": 1}}', FALSE,
  '{"type": "entries", "entries": ["This spell is a minor magical trick that novice spellcasters use for practice."]}'),

-- Level 1 Spells
('Magic Missile', 'PHB', 1, 'Evocation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 120}}',
  '{"v": true, "s": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["You create three glowing darts of magical force."]}'),

('Shield', 'PHB', 1, 'Abjuration',
  '{"number": 1, "unit": "reaction"}',
  '{"type": "point", "distance": {"type": "self"}}',
  '{"v": true, "s": true}',
  '{"type": "timed", "duration": {"type": "rounds", "amount": 1}}', TRUE,
  '{"type": "entries", "entries": ["An invisible barrier of magical force appears and protects you."]}'),

('Cure Wounds', 'PHB', 1, 'Evocation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "touch"}}',
  '{"v": true, "s": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier."]}'),

('Sleep', 'PHB', 1, 'Enchantment',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 90}}',
  '{"v": true, "s": true, "m": "a pinch of fine sand, rose petals, or a cricket"}',
  '{"type": "timed", "duration": {"type": "minutes", "amount": 1}}', FALSE,
  '{"type": "entries", "entries": ["This spell sends creatures into a magical slumber."]}'),

-- Level 2 Spells
('Invisibility', 'PHB', 2, 'Illusion',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "touch"}}',
  '{"v": true, "s": true, "m": "an eyelash encased in gum"}',
  '{"type": "timed", "duration": {"type": "hours", "amount": 1}}', TRUE,
  '{"type": "entries", "entries": ["A creature you touch becomes invisible until the spell ends."]}'),

('Hold Person', 'PHB', 2, 'Enchantment',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 60}}',
  '{"v": true, "s": true, "m": "a small, straight piece of iron"}',
  '{"type": "timed", "duration": {"type": "minutes", "amount": 1}}', TRUE,
  '{"type": "entries", "entries": ["Choose a humanoid that you can see within range."]}'),

-- Level 3 Spells
('Fireball', 'PHB', 3, 'Evocation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 150}}',
  '{"v": true, "s": true, "m": "a tiny ball of bat guano and sulfur"}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["A bright streak flashes from your pointing finger to a point you choose within range."]}'),

('Counterspell', 'PHB', 3, 'Abjuration',
  '{"number": 1, "unit": "reaction"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 60}}',
  '{"v": true, "s": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["You attempt to interrupt a creature in the process of casting a spell."]}'),

('Haste', 'PHB', 3, 'Transmutation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 30}}',
  '{"v": true, "s": true, "m": "a shaving of licorice root"}',
  '{"type": "timed", "duration": {"type": "minutes", "amount": 1}}', TRUE,
  '{"type": "entries", "entries": ["Choose a willing creature that you can see within range."]}'),

-- Higher Level Spells
('Dimension Door', 'PHB', 4, 'Conjuration',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 500}}',
  '{"v": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["You teleport yourself from your current location to any other spot within range."]}'),

('Greater Invisibility', 'PHB', 4, 'Illusion',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "touch"}}',
  '{"v": true, "s": true}',
  '{"type": "timed", "duration": {"type": "minutes", "amount": 1}}', TRUE,
  '{"type": "entries", "entries": ["You or a creature you touch becomes invisible until the spell ends."]}'),

('Finger of Death', 'PHB', 7, 'Necromancy',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 60}}',
  '{"v": true, "s": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["You send negative energy coursing through a creature."]}'),

('Meteor Swarm', 'PHB', 9, 'Evocation',
  '{"number": 1, "unit": "action"}',
  '{"type": "point", "distance": {"type": "feet", "amount": 1}}',
  '{"v": true, "s": true}',
  '{"type": "instant"}', FALSE,
  '{"type": "entries", "entries": ["Blazing orbs of fire plummet to the ground at four different points."]}')
ON CONFLICT DO NOTHING;

-- Link spells to classes
INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Fire Bolt' AND c.name IN ('Wizard', 'Sorcerer')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Magic Missile' AND c.name = 'Wizard'
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Shield' AND c.name IN ('Wizard', 'Sorcerer', 'Paladin', 'Cleric')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Cure Wounds' AND c.name IN ('Cleric', 'Paladin', 'Druid', 'Ranger', 'Bard')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Fireball' AND c.name IN ('Wizard', 'Sorcerer')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Counterspell' AND c.name IN ('Wizard', 'Sorcerer', 'Warlock', 'Bard')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Haste' AND c.name IN ('Wizard', 'Sorcerer', 'Druid', 'Ranger', 'Paladin')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Finger of Death' AND c.name IN ('Wizard', 'Warlock', 'Sorcerer')
ON CONFLICT DO NOTHING;

INSERT INTO spell_class (spell_id, class_id)
SELECT s.id, c.id FROM spell s, class c 
WHERE s.name = 'Meteor Swarm' AND c.name = 'Wizard'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE BACKGROUNDS
-- ============================================================================

INSERT INTO background (name, source, skill_proficiencies, feature_name, page) VALUES
('Acolyte', 'PHB', '["Insight", "Religion"]', 'Shelter of the Faithful', 127),
('Charlatan', 'PHB', '["Deception", "Sleight of Hand"]', 'False Identity', 128),
('Criminal', 'PHB', '["Deception", "Stealth"]', 'Criminal Contact', 129),
('Entertainer', 'PHB', '["Acrobatics", "Performance"]', 'By Popular Demand', 130),
('Folk Hero', 'PHB', '["Animal Handling", "Survival"]', 'Rustic Hospitality', 131),
('Guild Artisan', 'PHB', '["Insight", "Persuasion"]', 'Guild Membership', 132),
('Hermit', 'PHB', '["Medicine", "Religion"]', 'Discovery', 133),
('Noble', 'PHB', '["History", "Persuasion"]', 'Position of Privilege', 135),
('Outlander', 'PHB', '["Athletics", "Survival"]', 'Wanderer', 136),
('Sage', 'PHB', '["Arcana", "History"]', 'Researcher', 137),
('Sailor', 'PHB', '["Athletics", "Perception"]', 'Ship''s Passage', 139),
('Soldier', 'PHB', '["Athletics", "Intimidation"]', 'Military Rank', 140)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE USER DATA (Based on party.json)
-- ============================================================================

-- Create a party
INSERT INTO party (name, description) VALUES
('The Adventuring Party', 'A group of heroes seeking glory and adventure')
RETURNING id;

-- Get IDs for linking
DO $$
DECLARE
  fire_genasi_id UUID;
  tiefling_id UUID;
  elf_id UUID;
  dwarf_id UUID;
  half_elf_id UUID;
  dragonborn_id UUID;
  wizard_id UUID;
  sorcerer_id UUID;
  warlock_id UUID;
  bard_id UUID;
  rogue_id UUID;
  party_id UUID;
BEGIN
  -- Get race IDs
  SELECT id INTO fire_genasi_id FROM race WHERE name = 'Genasi' LIMIT 1;
  SELECT id INTO tiefling_id FROM race WHERE name = 'Tiefling' LIMIT 1;
  SELECT id INTO elf_id FROM race WHERE name = 'Elf' LIMIT 1;
  SELECT id INTO dwarf_id FROM race WHERE name = 'Dwarf' LIMIT 1;
  SELECT id INTO half_elf_id FROM race WHERE name = 'Half-Elf' LIMIT 1;
  SELECT id INTO dragonborn_id FROM race WHERE name = 'Dragonborn' LIMIT 1;
  
  -- Get class IDs
  SELECT id INTO wizard_id FROM class WHERE name = 'Wizard' LIMIT 1;
  SELECT id INTO sorcerer_id FROM class WHERE name = 'Sorcerer' LIMIT 1;
  SELECT id INTO warlock_id FROM class WHERE name = 'Warlock' LIMIT 1;
  SELECT id INTO bard_id FROM class WHERE name = 'Bard' LIMIT 1;
  SELECT id INTO rogue_id FROM class WHERE name = 'Rogue' LIMIT 1;
  
  -- Create party
  INSERT INTO party (name, description) VALUES ('Main Party', 'Primary adventuring group') RETURNING id INTO party_id;
  
  -- Create characters
  INSERT INTO "character" (party_id, name, player_name, level, race_id, class_id, max_hp, current_hp,
    str_score, dex_score, con_score, int_score, wis_score, cha_score) VALUES
  (party_id, 'Virex the Cataclysm', 'Tomas', 5, fire_genasi_id, sorcerer_id, 40, 40, 9, 14, 14, 17, 11, 16),
  (party_id, 'Fizz', 'Arturas', 5, tiefling_id, sorcerer_id, 32, 32, 10, 16, 12, 11, 9, 15),
  (party_id, 'Yoric', 'Arta', 5, elf_id, warlock_id, 41, 41, 10, 14, 12, 13, 14, 12),
  (party_id, 'Hodolf', 'Benas', 5, dwarf_id, bard_id, 62, 62, 14, 12, 16, 10, 13, 14),
  (party_id, 'Vire', 'Tadas', 5, half_elf_id, rogue_id, 50, 50, 12, 18, 14, 14, 12, 16),
  (party_id, 'Sazaras', 'Mantelis', 5, dragonborn_id, rogue_id, 37, 37, 14, 16, 12, 12, 10, 8);
END $$;

-- ============================================================================
-- SAMPLE ENCOUNTERS (Based on savedEncounters.json)
-- ============================================================================

DO $$
DECLARE
  goblin_id UUID;
  hobgoblin_id UUID;
  wraith_id UUID;
  zombie_id UUID;
  skeleton_id UUID;
  encounter_id UUID;
BEGIN
  SELECT id INTO goblin_id FROM monster WHERE name = 'Goblin' LIMIT 1;
  SELECT id INTO hobgoblin_id FROM monster WHERE name = 'Hobgoblin' LIMIT 1;
  SELECT id INTO wraith_id FROM monster WHERE name = 'Wraith' LIMIT 1;
  SELECT id INTO zombie_id FROM monster WHERE name = 'Zombie' LIMIT 1;
  SELECT id INTO skeleton_id FROM monster WHERE name = 'Skeleton' LIMIT 1;
  
  -- Goblin Ambush
  INSERT INTO encounter (name, difficulty, party_level, description) VALUES
  ('Goblin Ambush', 'medium', 5, 'A group of goblins led by a hobgoblin lie in wait.')
  RETURNING id INTO encounter_id;
  
  INSERT INTO encounter_monster (encounter_id, monster_id, quantity, max_hp) VALUES
  (encounter_id, goblin_id, 4, 7),
  (encounter_id, hobgoblin_id, 1, 11);
  
  -- Undead Horror
  INSERT INTO encounter (name, difficulty, party_level, description) VALUES
  ('Undead Horror', 'hard', 5, 'A wraith and its zombie minions emerge from the shadows.')
  RETURNING id INTO encounter_id;
  
  INSERT INTO encounter_monster (encounter_id, monster_id, quantity, max_hp) VALUES
  (encounter_id, wraith_id, 1, 67),
  (encounter_id, zombie_id, 2, 22),
  (encounter_id, skeleton_id, 1, 13);
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check seed counts
SELECT 
  (SELECT COUNT(*) FROM race) as races,
  (SELECT COUNT(*) FROM class) as classes,
  (SELECT COUNT(*) FROM subclass) as subclasses,
  (SELECT COUNT(*) FROM spell) as spells,
  (SELECT COUNT(*) FROM monster) as monsters,
  (SELECT COUNT(*) FROM condition) as conditions,
  (SELECT COUNT(*) FROM background) as backgrounds,
  (SELECT COUNT(*) FROM "character") as characters,
  (SELECT COUNT(*) FROM encounter) as encounters;
