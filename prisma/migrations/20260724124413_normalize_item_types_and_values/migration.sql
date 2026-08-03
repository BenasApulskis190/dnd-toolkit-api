-- AlterTable
ALTER TABLE "item" ADD COLUMN     "armor_type" TEXT,
ADD COLUMN     "attunement_requirement" TEXT,
ADD COLUMN     "types" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "value_estimated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "value_gp" DOUBLE PRECISION,
ADD COLUMN     "weapon_category" TEXT,
ADD COLUMN     "weapon_type" TEXT;
