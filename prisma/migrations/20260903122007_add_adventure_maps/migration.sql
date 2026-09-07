-- CreateTable
CREATE TABLE "adventure_map" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "adventure_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adventure_map_pin" (
    "id" TEXT NOT NULL,
    "map_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "entry_name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "adventure_map_pin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adventure_map_section_id_name_key" ON "adventure_map"("section_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "adventure_map_pin_map_id_label_x_y_key" ON "adventure_map_pin"("map_id", "label", "x", "y");

-- AddForeignKey
ALTER TABLE "adventure_map" ADD CONSTRAINT "adventure_map_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "adventure_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adventure_map_pin" ADD CONSTRAINT "adventure_map_pin_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "adventure_map"("id") ON DELETE CASCADE ON UPDATE CASCADE;
