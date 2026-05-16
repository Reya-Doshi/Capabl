/*
  Warnings:

  - The `readinessScore` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `strengths` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `missingSkills` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `aiSuggestions` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `extractedSkills` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `languages` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AIAnalysis" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "atsScore" INTEGER,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "cgpa" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "githubScore" INTEGER,
ADD COLUMN     "internshipExperience" TEXT[],
ADD COLUMN     "linkedinScore" INTEGER,
ADD COLUMN     "projectTechnologies" TEXT[],
ADD COLUMN     "projectTitles" TEXT[],
ADD COLUMN     "recommendedCourses" TEXT[],
ADD COLUMN     "recommendedInternships" TEXT[],
ADD COLUMN     "recommendedProjects" TEXT[],
ADD COLUMN     "recommendedRoles" TEXT[],
ADD COLUMN     "resumeScore" INTEGER,
ADD COLUMN     "weaknesses" TEXT[],
ADD COLUMN     "whyRecommendations" TEXT[],
DROP COLUMN "readinessScore",
ADD COLUMN     "readinessScore" INTEGER,
DROP COLUMN "strengths",
ADD COLUMN     "strengths" TEXT[],
DROP COLUMN "missingSkills",
ADD COLUMN     "missingSkills" TEXT[],
DROP COLUMN "aiSuggestions",
ADD COLUMN     "aiSuggestions" TEXT[],
DROP COLUMN "extractedSkills",
ADD COLUMN     "extractedSkills" TEXT[],
DROP COLUMN "languages",
ADD COLUMN     "languages" TEXT[];

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "deadline" TEXT,
ADD COLUMN     "description" TEXT;
