-- CreateTable
CREATE TABLE "book" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ability_score" (
    "id" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ability_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alignment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "alignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "damage_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_of_magic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,

    CONSTRAINT "school_of_magic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ability_score" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "page" INTEGER,
    "size" TEXT,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "darkvision" INTEGER,
    "speed_fly" INTEGER,
    "speed_swim" INTEGER,
    "str_bonus" INTEGER,
    "dex_bonus" INTEGER,
    "con_bonus" INTEGER,
    "int_bonus" INTEGER,
    "wis_bonus" INTEGER,
    "cha_bonus" INTEGER,
    "description" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_language" (
    "raceId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "race_language_pkey" PRIMARY KEY ("raceId","languageId")
);

-- CreateTable
CREATE TABLE "subrace" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "page" INTEGER,
    "abilityBonuses" JSONB,
    "description" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "hit_die" INTEGER NOT NULL,
    "proficiency_str" BOOLEAN NOT NULL DEFAULT false,
    "proficiency_dex" BOOLEAN NOT NULL DEFAULT false,
    "proficiency_con" BOOLEAN NOT NULL DEFAULT false,
    "proficiency_int" BOOLEAN NOT NULL DEFAULT false,
    "proficiency_wis" BOOLEAN NOT NULL DEFAULT false,
    "proficiency_cha" BOOLEAN NOT NULL DEFAULT false,
    "subclass_title" TEXT,
    "description" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_feature" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" JSONB NOT NULL,
    "gain_subclass_feature" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subclass" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "source" TEXT NOT NULL,
    "description" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subclass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subclass_feature" (
    "id" TEXT NOT NULL,
    "subclassId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subclass_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT,
    "casting_time" JSONB NOT NULL,
    "range" JSONB NOT NULL,
    "components" JSONB NOT NULL,
    "material_description" TEXT,
    "duration" JSONB NOT NULL,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "description" JSONB NOT NULL,
    "higher_level" JSONB,
    "damage_type" TEXT,
    "saving_throw" TEXT,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell_class" (
    "id" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "from_subclass" BOOLEAN NOT NULL DEFAULT false,
    "subclassId" TEXT,

    CONSTRAINT "spell_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "skill_proficiencies" JSONB,
    "tool_proficiencies" JSONB,
    "languages" JSONB,
    "starting_gold" INTEGER,
    "feature_name" TEXT,
    "feature_description" JSONB,
    "suggested_traits" JSONB,
    "suggested_ideals" JSONB,
    "suggested_bonds" JSONB,
    "suggested_flaws" JSONB,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_language" (
    "backgroundId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "background_language_pkey" PRIMARY KEY ("backgroundId","languageId")
);

-- CreateTable
CREATE TABLE "feat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "prerequisite" JSONB,
    "ability_bonuses" JSONB,
    "description" JSONB NOT NULL,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "pantheon" TEXT,
    "alignment" TEXT,
    "domains" JSONB,
    "symbol" TEXT,
    "description" JSONB,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "rarity" TEXT,
    "attunement" BOOLEAN NOT NULL DEFAULT false,
    "value" TEXT,
    "weight" DOUBLE PRECISION,
    "damage" TEXT,
    "damage_type" TEXT,
    "armor_class" INTEGER,
    "strength_requirement" INTEGER,
    "stealth_disadvantage" BOOLEAN NOT NULL DEFAULT false,
    "description" JSONB,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "monster_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "tags" JSONB,
    "alignment" JSONB,
    "armor_class" INTEGER,
    "armor_type" TEXT,
    "hit_points_avg" INTEGER,
    "hit_points_formula" TEXT,
    "speed_walk" INTEGER,
    "speed_fly" INTEGER,
    "speed_swim" INTEGER,
    "speed_climb" INTEGER,
    "str_score" INTEGER,
    "dex_score" INTEGER,
    "con_score" INTEGER,
    "int_score" INTEGER,
    "wis_score" INTEGER,
    "cha_score" INTEGER,
    "str_save" INTEGER,
    "dex_save" INTEGER,
    "con_save" INTEGER,
    "int_save" INTEGER,
    "wis_save" INTEGER,
    "cha_save" INTEGER,
    "skills" JSONB,
    "senses" TEXT,
    "passive_perception" INTEGER,
    "languages" TEXT,
    "challenge_rating" TEXT NOT NULL,
    "cr_value" DOUBLE PRECISION,
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_trait" (
    "id" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monster_trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_action" (
    "id" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'action',
    "description" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monster_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character" (
    "id" TEXT NOT NULL,
    "partyId" TEXT,
    "name" TEXT NOT NULL,
    "player_name" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "raceId" TEXT,
    "subraceId" TEXT,
    "classId" TEXT,
    "subclassId" TEXT,
    "backgroundId" TEXT,
    "currentHp" INTEGER,
    "max_hp" INTEGER,
    "temp_hp" INTEGER NOT NULL DEFAULT 0,
    "proficiency_bonus" INTEGER,
    "experience_points" INTEGER NOT NULL DEFAULT 0,
    "str_score" INTEGER NOT NULL DEFAULT 10,
    "dex_score" INTEGER NOT NULL DEFAULT 10,
    "con_score" INTEGER NOT NULL DEFAULT 10,
    "int_score" INTEGER NOT NULL DEFAULT 10,
    "wis_score" INTEGER NOT NULL DEFAULT 10,
    "cha_score" INTEGER NOT NULL DEFAULT 10,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_spell" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "used_per_day" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_feature" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "description" TEXT,
    "uses_remaining" INTEGER,
    "max_uses" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_item" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT,
    "custom_name" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "attuned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "party_level" INTEGER,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_monster" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "initiative" INTEGER,
    "current_hp" INTEGER,
    "max_hp" INTEGER,
    "conditions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "encounter_monster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_code_key" ON "book"("code");

-- CreateIndex
CREATE UNIQUE INDEX "language_name_key" ON "language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ability_score_abbreviation_key" ON "ability_score"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "alignment_code_key" ON "alignment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "damage_type_name_key" ON "damage_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "school_of_magic_name_key" ON "school_of_magic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_key" ON "skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "race_name_source_key" ON "race"("name", "source");

-- CreateIndex
CREATE UNIQUE INDEX "subrace_raceId_name_key" ON "subrace"("raceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "class_name_key" ON "class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subclass_classId_name_key" ON "subclass"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "spell_name_source_key" ON "spell"("name", "source");

-- CreateIndex
CREATE UNIQUE INDEX "spell_class_spellId_classId_subclassId_key" ON "spell_class"("spellId", "classId", "subclassId");

-- CreateIndex
CREATE UNIQUE INDEX "condition_name_key" ON "condition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "background_name_key" ON "background"("name");

-- CreateIndex
CREATE UNIQUE INDEX "feat_name_key" ON "feat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "deity_name_source_key" ON "deity"("name", "source");

-- CreateIndex
CREATE UNIQUE INDEX "item_name_source_key" ON "item"("name", "source");

-- CreateIndex
CREATE UNIQUE INDEX "monster_type_name_key" ON "monster_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "monster_name_source_key" ON "monster"("name", "source");

-- CreateIndex
CREATE UNIQUE INDEX "character_spell_characterId_spellId_key" ON "character_spell"("characterId", "spellId");

-- CreateIndex
CREATE UNIQUE INDEX "encounter_monster_encounterId_monsterId_key" ON "encounter_monster"("encounterId", "monsterId");

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_ability_score_fkey" FOREIGN KEY ("ability_score") REFERENCES "ability_score"("abbreviation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_language" ADD CONSTRAINT "race_language_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_language" ADD CONSTRAINT "race_language_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subrace" ADD CONSTRAINT "subrace_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_feature" ADD CONSTRAINT "class_feature_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subclass" ADD CONSTRAINT "subclass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subclass_feature" ADD CONSTRAINT "subclass_feature_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "subclass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_class" ADD CONSTRAINT "spell_class_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_class" ADD CONSTRAINT "spell_class_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_class" ADD CONSTRAINT "spell_class_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "subclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_language" ADD CONSTRAINT "background_language_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "background"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_language" ADD CONSTRAINT "background_language_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster" ADD CONSTRAINT "monster_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "monster_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_trait" ADD CONSTRAINT "monster_trait_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "monster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_action" ADD CONSTRAINT "monster_action_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "monster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_subraceId_fkey" FOREIGN KEY ("subraceId") REFERENCES "subrace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_subclassId_fkey" FOREIGN KEY ("subclassId") REFERENCES "subclass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spell" ADD CONSTRAINT "character_spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spell" ADD CONSTRAINT "character_spell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_feature" ADD CONSTRAINT "character_feature_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_item" ADD CONSTRAINT "character_item_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_item" ADD CONSTRAINT "character_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_monster" ADD CONSTRAINT "encounter_monster_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_monster" ADD CONSTRAINT "encounter_monster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "monster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
