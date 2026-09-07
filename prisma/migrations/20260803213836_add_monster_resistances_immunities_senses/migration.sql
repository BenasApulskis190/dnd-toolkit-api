-- AlterTable
ALTER TABLE "monster" ADD COLUMN     "condition_immunities" JSONB,
ADD COLUMN     "damage_immunities" JSONB,
ADD COLUMN     "damage_resistances" JSONB,
ADD COLUMN     "damage_vulnerabilities" JSONB,
ADD COLUMN     "speed_burrow" INTEGER;
