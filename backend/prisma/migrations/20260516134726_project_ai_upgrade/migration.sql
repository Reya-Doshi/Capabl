-- AlterTable
ALTER TABLE "AIAnalysis" ADD COLUMN     "completedProjects" INTEGER,
ADD COLUMN     "inProgressProjects" INTEGER,
ADD COLUMN     "projectDescriptions" TEXT[],
ADD COLUMN     "projectImages" TEXT[],
ADD COLUMN     "projectStatuses" TEXT[],
ADD COLUMN     "recommendedProjectDesc" TEXT[],
ADD COLUMN     "recommendedProjectTags" TEXT[],
ADD COLUMN     "recommendedProjectTitles" TEXT[],
ADD COLUMN     "savedProjects" TEXT[],
ADD COLUMN     "totalProjects" INTEGER;
