CREATE TABLE IF NOT EXISTS "TriageRule" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "labelPattern" TEXT NOT NULL DEFAULT '',
  "priority" "IssuePriority",
  "assigneeId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TriageRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TriageRule_organizationId_idx" ON "TriageRule"("organizationId");
