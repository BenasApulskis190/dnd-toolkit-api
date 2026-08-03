-- CreateTable
CREATE TABLE "public"."monster_spell" (
    "id" TEXT NOT NULL,
    "monster_id" TEXT NOT NULL,
    "spell_id" TEXT NOT NULL,

    CONSTRAINT "monster_spell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monster_spell_monster_id_spell_id_key" ON "public"."monster_spell"("monster_id" ASC, "spell_id" ASC);

-- AddForeignKey
ALTER TABLE "public"."monster_spell" ADD CONSTRAINT "monster_spell_monster_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "public"."monster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monster_spell" ADD CONSTRAINT "monster_spell_spell_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "public"."spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
