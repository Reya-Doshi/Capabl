-- Reconciliation migration (BUG-012 / BUG-014).
--
-- The modern InterviewSession columns were applied to the database via
-- `prisma db push` without a corresponding migration file, so replaying the
-- migration history produced the OLD InterviewSession shape while the live
-- database held the NEW one. This migration brings the migration history in
-- line with reality: it upgrades the InterviewSession table created by
-- `20260523144440_add_interview_sessions` to the shape defined in schema.prisma.
--
-- On the existing dev database this migration is marked as already-applied
-- (`prisma migrate resolve --applied`) because the columns are already present;
-- on a fresh deploy it runs normally on top of the old table. Generated with
-- `prisma migrate diff --from-migrations --to-schema-datamodel` for an exact match.

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "durationKey",
DROP COLUMN "topic",
ADD COLUMN     "agentPrompt" TEXT,
ADD COLUMN     "careerFit" TEXT,
ADD COLUMN     "clarityScore" INTEGER,
ADD COLUMN     "communicationScore" INTEGER,
ADD COLUMN     "confidenceScore" INTEGER,
ADD COLUMN     "contextSnapshot" JSONB,
ADD COLUMN     "culturalFitScore" INTEGER,
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'one-on-one',
ADD COLUMN     "improvementPlan" TEXT[],
ADD COLUMN     "interviewerName" TEXT DEFAULT 'Rexa',
ADD COLUMN     "medium" TEXT NOT NULL DEFAULT 'ai',
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "problemSolvingScore" INTEGER,
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'technical',
ADD COLUMN     "readinessScore" INTEGER,
ADD COLUMN     "retellAgentId" TEXT,
ADD COLUMN     "retellCallId" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "skillGaps" TEXT[],
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'first',
ADD COLUMN     "technicalScore" INTEGER,
ADD COLUMN     "turns" JSONB,
ADD COLUMN     "voiceProvider" TEXT,
ALTER COLUMN "totalQuestions" SET DEFAULT 6,
ALTER COLUMN "status" SET DEFAULT 'scheduled';

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSession_retellCallId_key" ON "InterviewSession"("retellCallId");
