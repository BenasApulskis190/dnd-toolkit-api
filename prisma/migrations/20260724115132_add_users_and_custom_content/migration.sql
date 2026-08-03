-- AlterTable
ALTER TABLE "item" ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "monster" ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "spell" ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "google_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_google_id_key" ON "app_user"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE INDEX "item_created_by_id_idx" ON "item"("created_by_id");

-- CreateIndex
CREATE INDEX "monster_created_by_id_idx" ON "monster"("created_by_id");

-- CreateIndex
CREATE INDEX "spell_created_by_id_idx" ON "spell"("created_by_id");

-- AddForeignKey
ALTER TABLE "spell" ADD CONSTRAINT "spell_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster" ADD CONSTRAINT "monster_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
