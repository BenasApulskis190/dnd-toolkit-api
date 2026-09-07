/*
  Warnings:

  - You are about to drop the column `difficulty` on the `encounter` table. All the data in the column will be lost.
  - You are about to drop the column `party_level` on the `encounter` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `encounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "encounter" DROP COLUMN "difficulty",
DROP COLUMN "party_level",
ADD COLUMN     "party_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "encounter_user_id_idx" ON "encounter"("user_id");

-- AddForeignKey
ALTER TABLE "encounter" ADD CONSTRAINT "encounter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter" ADD CONSTRAINT "encounter_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
