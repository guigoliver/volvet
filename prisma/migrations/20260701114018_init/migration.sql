-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TemplateRingDef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "segmentCount" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    CONSTRAINT "TemplateRingDef_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateSegmentDef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ringDefId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "defaultLabel" TEXT,
    "defaultMeaning" TEXT,
    CONSTRAINT "TemplateSegmentDef_ringDefId_fkey" FOREIGN KEY ("ringDefId") REFERENCES "TemplateRingDef" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wheel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "templateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wheel_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ring" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wheelId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "segmentCount" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "rotationDegrees" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Ring_wheelId_fkey" FOREIGN KEY ("wheelId") REFERENCES "Wheel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ringId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "meaning" TEXT,
    CONSTRAINT "Segment_ringId_fkey" FOREIGN KEY ("ringId") REFERENCES "Ring" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CombinationMeaning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wheelId" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CombinationMeaning_wheelId_fkey" FOREIGN KEY ("wheelId") REFERENCES "Wheel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CombinationSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "combinationMeaningId" TEXT NOT NULL,
    "ringId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    CONSTRAINT "CombinationSegment_combinationMeaningId_fkey" FOREIGN KEY ("combinationMeaningId") REFERENCES "CombinationMeaning" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CombinationSegment_ringId_fkey" FOREIGN KEY ("ringId") REFERENCES "Ring" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CombinationSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateRingDef_templateId_order_key" ON "TemplateRingDef"("templateId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSegmentDef_ringDefId_index_key" ON "TemplateSegmentDef"("ringDefId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Ring_wheelId_order_key" ON "Ring"("wheelId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_ringId_index_key" ON "Segment"("ringId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "CombinationSegment_combinationMeaningId_ringId_key" ON "CombinationSegment"("combinationMeaningId", "ringId");
