-- CreateTable
CREATE TABLE "SkillProgress" (
    "id" SERIAL NOT NULL,
    "skillName" TEXT NOT NULL,
    "source" TEXT DEFAULT 'manual',
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyTaskProgress" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "taskKey" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WeeklyTaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillProgress_userId_skillName_key" ON "SkillProgress"("userId", "skillName");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTaskProgress_userId_week_taskKey_key" ON "WeeklyTaskProgress"("userId", "week", "taskKey");

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTaskProgress" ADD CONSTRAINT "WeeklyTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
