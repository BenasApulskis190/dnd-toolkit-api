-- AlterTable
ALTER TABLE "character" ADD COLUMN     "armor_class" INTEGER,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "passive_insight" INTEGER,
ADD COLUMN     "passive_investigation" INTEGER,
ADD COLUMN     "passive_perception" INTEGER,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "party" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "character_user_id_idx" ON "character"("user_id");

-- CreateIndex
CREATE INDEX "party_user_id_idx" ON "party"("user_id");

-- AddForeignKey
ALTER TABLE "party" ADD CONSTRAINT "party_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

