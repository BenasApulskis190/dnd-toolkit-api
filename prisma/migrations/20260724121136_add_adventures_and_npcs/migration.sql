-- CreateTable
CREATE TABLE "adventure" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storyline" TEXT,
    "level_start" INTEGER,
    "level_end" INTEGER,
    "published" TIMESTAMP(3),
    "book_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adventure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adventure_section" (
    "id" TEXT NOT NULL,
    "adventure_id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "headers" JSONB,
    "entries" JSONB NOT NULL,
    "images" JSONB,

    CONSTRAINT "adventure_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "adventure_id" TEXT NOT NULL,
    "monster_id" TEXT,
    "token_url" TEXT,

    CONSTRAINT "npc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adventure_code_key" ON "adventure"("code");

-- CreateIndex
CREATE UNIQUE INDEX "adventure_section_adventure_id_ordinal_key" ON "adventure_section"("adventure_id", "ordinal");

-- CreateIndex
CREATE INDEX "npc_monster_id_idx" ON "npc"("monster_id");

-- CreateIndex
CREATE UNIQUE INDEX "npc_adventure_id_name_key" ON "npc"("adventure_id", "name");

-- AddForeignKey
ALTER TABLE "adventure" ADD CONSTRAINT "adventure_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adventure_section" ADD CONSTRAINT "adventure_section_adventure_id_fkey" FOREIGN KEY ("adventure_id") REFERENCES "adventure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc" ADD CONSTRAINT "npc_adventure_id_fkey" FOREIGN KEY ("adventure_id") REFERENCES "adventure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc" ADD CONSTRAINT "npc_monster_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
