
-- DropForeignKey
ALTER TABLE "item" DROP CONSTRAINT "item_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "monster" DROP CONSTRAINT "monster_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "spell" DROP CONSTRAINT "spell_created_by_id_fkey";

-- DropIndex
DROP INDEX "item_created_by_id_idx";

-- DropIndex
DROP INDEX "monster_created_by_id_idx";

-- DropIndex
DROP INDEX "spell_created_by_id_idx";

-- AlterTable
ALTER TABLE "item" DROP COLUMN "created_by_id",
DROP COLUMN "is_custom";

-- AlterTable
ALTER TABLE "monster" DROP COLUMN "created_by_id",
DROP COLUMN "is_custom";

-- AlterTable
ALTER TABLE "spell" DROP COLUMN "created_by_id",
DROP COLUMN "is_custom";

-- CreateTable
CREATE TABLE "spell_to_user" (
    "id" TEXT NOT NULL,
    "spell_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spell_to_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_to_user" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_to_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_to_user" (
    "id" TEXT NOT NULL,
    "monster_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monster_to_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc_to_user" (
    "id" TEXT NOT NULL,
    "npc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "npc_to_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spell_to_user_spell_id_user_id_key" ON "spell_to_user"("spell_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_to_user_item_id_user_id_key" ON "item_to_user"("item_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "monster_to_user_monster_id_user_id_key" ON "monster_to_user"("monster_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "npc_to_user_npc_id_user_id_key" ON "npc_to_user"("npc_id", "user_id");

-- AddForeignKey
ALTER TABLE "spell_to_user" ADD CONSTRAINT "spell_to_user_spell_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_to_user" ADD CONSTRAINT "spell_to_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_to_user" ADD CONSTRAINT "item_to_user_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_to_user" ADD CONSTRAINT "item_to_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_to_user" ADD CONSTRAINT "monster_to_user_monster_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_to_user" ADD CONSTRAINT "monster_to_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_to_user" ADD CONSTRAINT "npc_to_user_npc_id_fkey" FOREIGN KEY ("npc_id") REFERENCES "npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_to_user" ADD CONSTRAINT "npc_to_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

