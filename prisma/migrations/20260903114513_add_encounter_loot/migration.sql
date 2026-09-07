-- CreateTable
CREATE TABLE "encounter_loot" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "itemId" TEXT,
    "custom_name" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "value_gp" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encounter_loot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "encounter_loot" ADD CONSTRAINT "encounter_loot_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_loot" ADD CONSTRAINT "encounter_loot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
