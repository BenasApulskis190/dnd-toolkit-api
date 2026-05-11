-- D&D Toolkit Database Schema
-- PostgreSQL Migration
-- Run this after PostgreSQL container is up: 
-- docker exec -i postgres psql -U appuser -d dnndb < api/database/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LOOKUP / REFERENCE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS book (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ability_score (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abbreviation VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS alignment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS damage_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS school_of_magic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    abbreviation VARCHAR(5) NOT NULL
);

CREATE TABLE IF NOT EXISTS skill (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    ability_score VARCHAR(3) NOT NULL,
    description TEXT,
    FOREIGN KEY (ability_score) REFERENCES ability_score(abbreviation)
);

-- ============================================================================
-- CORE GAME CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS race (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    page INT,
    size VARCHAR(10),
    speed INT DEFAULT 30,
    darkvision INT,
    speed_fly INT,
    speed_swim INT,
    str_bonus INT,
    dex_bonus INT,
    con_bonus INT,
    int_bonus INT,
    wis_bonus INT,
    cha_bonus INT,
    description JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, source)
);

CREATE TABLE IF NOT EXISTS subrace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    race_id UUID NOT NULL REFERENCES race(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50),
    page INT,
    ability_bonuses JSONB,
    description JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(race_id, name)
);

CREATE TABLE IF NOT EXISTS class (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,
    hit_die INT NOT NULL,
    proficiency_str BOOLEAN DEFAULT FALSE,
    proficiency_dex BOOLEAN DEFAULT FALSE,
    proficiency_con BOOLEAN DEFAULT FALSE,
    proficiency_int BOOLEAN DEFAULT FALSE,
    proficiency_wis BOOLEAN DEFAULT FALSE,
    proficiency_cha BOOLEAN DEFAULT FALSE,
    subclass_title VARCHAR(100),
    description JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_feature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    description JSONB NOT NULL,
    gain_subclass_feature BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subclass (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    source VARCHAR(50) NOT NULL,
    description JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(class_id, name)
);

CREATE TABLE IF NOT EXISTS subclass_feature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subclass_id UUID NOT NULL REFERENCES subclass(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    description JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spell (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    school VARCHAR(50),
    casting_time JSONB NOT NULL,
    range JSONB NOT NULL,
    components JSONB NOT NULL,
    material_description TEXT,
    duration JSONB NOT NULL,
    concentration BOOLEAN DEFAULT FALSE,
    ritual BOOLEAN DEFAULT FALSE,
    description JSONB NOT NULL,
    higher_level JSONB,
    damage_type VARCHAR(50),
    saving_throw VARCHAR(50),
    page INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spell_class (
    spell_id UUID NOT NULL REFERENCES spell(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    from_subclass BOOLEAN DEFAULT FALSE,
    subclass_id UUID REFERENCES subclass(id) ON DELETE SET NULL,
    PRIMARY KEY (spell_id, class_id, subclass_id)
);

CREATE TABLE IF NOT EXISTS condition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,
    description JSONB NOT NULL,
    page INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS background (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,
    skill_proficiencies JSONB,
    tool_proficiencies JSONB,
    languages JSONB,
    starting_gold INT,
    feature_name VARCHAR(100),
    feature_description JSONB,
    suggested_traits JSONB,
    suggested_ideals JSONB,
    suggested_bonds JSONB,
    suggested_flaws JSONB,
    page INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,
    prerequisite JSONB,
    ability_bonuses JSONB,
    description JSONB NOT NULL,
    page INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    pantheon VARCHAR(100),
    alignment VARCHAR(20),
    domains JSONB,
    symbol TEXT,
    description JSONB,
    page INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, source)
);

CREATE TABLE IF NOT EXISTS item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subtype VARCHAR(50),
    rarity VARCHAR(50),
    attunement BOOLEAN DEFAULT FALSE,
    value VARCHAR(50),
    weight DECIMAL(5,2),
    damage VARCHAR(50),
    damage_type VARCHAR(50),
    armor_class INT,
    strength_requirement INT,
    stealth_disadvantage BOOLEAN DEFAULT FALSE,
    description JSONB,
    page INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, source)
);

-- ============================================================================
-- MONSTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS monster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    size VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    tags JSONB,
    alignment JSONB,
    armor_class INT,
    armor_type VARCHAR(100),
    hit_points_avg INT,
    hit_points_formula VARCHAR(50),
    speed_walk INT,
    speed_fly INT,
    speed_swim INT,
    speed_climb INT,
    str_score INT,
    dex_score INT,
    con_score INT,
    int_score INT,
    wis_score INT,
    cha_score INT,
    str_save INT,
    dex_save INT,
    con_save INT,
    int_save INT,
    wis_save INT,
    cha_save INT,
    skills JSONB,
    senses TEXT,
    passive_perception INT,
    languages TEXT,
    challenge_rating VARCHAR(10) NOT NULL,
    cr_value DECIMAL(5,2),
    page INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, source)
);

CREATE TABLE IF NOT EXISTS monster_trait (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monster_id UUID NOT NULL REFERENCES monster(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monster_action (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monster_id UUID NOT NULL REFERENCES monster(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'action',
    description JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USER CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS party (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "character" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID REFERENCES party(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    player_name VARCHAR(100),
    level INT DEFAULT 1,
    race_id UUID REFERENCES race(id),
    subrace_id UUID REFERENCES subrace(id),
    class_id UUID REFERENCES class(id),
    subclass_id UUID REFERENCES subclass(id),
    background_id UUID REFERENCES background(id),
    current_hp INT,
    max_hp INT,
    temp_hp INT DEFAULT 0,
    proficiency_bonus INT,
    experience_points INT DEFAULT 0,
    str_score INT DEFAULT 10,
    dex_score INT DEFAULT 10,
    con_score INT DEFAULT 10,
    int_score INT DEFAULT 10,
    wis_score INT DEFAULT 10,
    cha_score INT DEFAULT 10,
    inspiration BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS character_spell (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES "character"(id) ON DELETE CASCADE,
    spell_id UUID NOT NULL REFERENCES spell(id) ON DELETE CASCADE,
    prepared BOOLEAN DEFAULT FALSE,
    used_per_day INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(character_id, spell_id)
);

CREATE TABLE IF NOT EXISTS character_feature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES "character"(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    description TEXT,
    uses_remaining INT,
    max_uses INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS character_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES "character"(id) ON DELETE CASCADE,
    item_id UUID REFERENCES item(id) ON DELETE SET NULL,
    custom_name VARCHAR(100),
    quantity INT DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    attuned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20),
    party_level INT,
    notes TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encounter_monster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID NOT NULL REFERENCES encounter(id) ON DELETE CASCADE,
    monster_id UUID NOT NULL REFERENCES monster(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    initiative INT,
    current_hp INT,
    max_hp INT,
    conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    UNIQUE(encounter_id, monster_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_monster_challenge_rating ON monster(cr_value);
CREATE INDEX IF NOT EXISTS idx_monster_type ON monster(type);
CREATE INDEX IF NOT EXISTS idx_monster_name ON monster(name);
CREATE INDEX IF NOT EXISTS idx_spell_level ON spell(level);
CREATE INDEX IF NOT EXISTS idx_spell_name ON spell(name);
CREATE INDEX IF NOT EXISTS idx_class_name ON class(name);
CREATE INDEX IF NOT EXISTS idx_race_name ON race(name);
CREATE INDEX IF NOT EXISTS idx_item_type ON item(type);
CREATE INDEX IF NOT EXISTS idx_item_rarity ON item(rarity);
CREATE INDEX IF NOT EXISTS idx_character_party ON "character"(party_id);
CREATE INDEX IF NOT EXISTS idx_character_race ON "character"(race_id);
CREATE INDEX IF NOT EXISTS idx_character_class ON "character"(class_id);
CREATE INDEX IF NOT EXISTS idx_encounter_active ON encounter(is_active);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_spell_name_search ON spell USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_monster_name_search ON monster USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_item_name_search ON item USING gin(to_tsvector('english', name));

-- ============================================================================
-- SEED DATA: Lookup Tables
-- ============================================================================

-- Ability Scores
INSERT INTO ability_score (abbreviation, name) VALUES
('str', 'Strength'),
('dex', 'Dexterity'),
('con', 'Constitution'),
('int', 'Intelligence'),
('wis', 'Wisdom'),
('cha', 'Charisma')
ON CONFLICT (abbreviation) DO NOTHING;

-- Alignments
INSERT INTO alignment (code, name) VALUES
('LG', 'Lawful Good'),
('NG', 'Neutral Good'),
('CG', 'Chaotic Good'),
('LN', 'Lawful Neutral'),
('NN', 'True Neutral'),
('CN', 'Chaotic Neutral'),
('LE', 'Lawful Evil'),
('NE', 'Neutral Evil'),
('CE', 'Chaotic Evil')
ON CONFLICT (code) DO NOTHING;

-- Schools of Magic
INSERT INTO school_of_magic (name, abbreviation) VALUES
('Abjuration', 'A'),
('Conjuration', 'C'),
('Divination', 'D'),
('Enchantment', 'E'),
('Evocation', 'EV'),
('Illusion', 'I'),
('Necromancy', 'N'),
('Transmutation', 'T')
ON CONFLICT (name) DO NOTHING;

-- Core Books
INSERT INTO book (code, name, type) VALUES
('PHB', 'Player''s Handbook', 'core'),
('MM', 'Monster Manual', 'core'),
('DMG', 'Dungeon Master''s Guide', 'core'),
('XGE', 'Xanathar''s Guide to Everything', 'expansion'),
('EEPC', 'Elemental Evil Player''s Companion', 'expansion'),
('VGM', 'Volo''s Guide to Monsters', 'expansion'),
('MTF', 'Mordenkainen''s Tome of Foes', 'expansion'),
('SCAG', 'Sword Coast Adventurer''s Guide', 'expansion'),
('TCE', 'Tasha''s Cauldron of Everything', 'expansion'),
('FTD', 'Fizban''s Treasury of Dragons', 'expansion'),
('AAG', 'Astral Adventurer''s Guide', 'expansion'),
('BGG', 'Bigby Presents: Glory of the Giants', 'expansion'),
('MotM', 'Monsters of the Multiverse', 'expansion'),
('AI', 'Adventures and Beginnings'),
('UA', 'Unearthed Arcana')
ON CONFLICT (code) DO NOTHING;

-- Damage Types
INSERT INTO damage_type (name) VALUES
('acid'), ('bludgeoning'), ('cold'), ('fire'), ('force'),
('lightning'), ('necrotic'), ('piercing'), ('poison'), ('psychic'),
('radiant'), ('slashing'), ('thunder')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_party_updated_at BEFORE UPDATE ON party
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_updated_at BEFORE UPDATE ON "character"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounter_updated_at BEFORE UPDATE ON encounter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
