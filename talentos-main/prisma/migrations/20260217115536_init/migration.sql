-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "genero" TEXT NOT NULL,
    "curso" TEXT NOT NULL DEFAULT '',
    "modalidad" TEXT NOT NULL DEFAULT '',
    "tienesIdeaCarrera" TEXT NOT NULL DEFAULT 'No',
    "ideaCarrera" TEXT,
    "centroEducativo" TEXT,
    "identificaCampos" TEXT,
    "campoIdentificado" TEXT,
    "ideaCarreraFinal" TEXT,
    "ideaCarreraTextoFinal" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "answersJson" JSONB NOT NULL,
    "scoresJson" JSONB NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- CreateIndex
CREATE INDEX "Submission_genero_idx" ON "Submission"("genero");

-- CreateIndex
CREATE INDEX "Submission_centroEducativo_idx" ON "Submission"("centroEducativo");

-- CreateIndex
CREATE INDEX "Assessment_email_idx" ON "Assessment"("email");

-- CreateIndex
CREATE INDEX "Assessment_submissionId_idx" ON "Assessment"("submissionId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
