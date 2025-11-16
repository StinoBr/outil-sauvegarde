-- CreateEnum
CREATE TYPE "TypeSGBD" AS ENUM ('PostgreSQL', 'MySQL', 'MongoDB', 'SQLite');

-- CreateEnum
CREATE TYPE "StatutOperation" AS ENUM ('EnCours', 'Succes', 'Echec');

-- CreateTable
CREATE TABLE "SGBDCible" (
    "id" SERIAL NOT NULL,
    "nomConnexion" TEXT NOT NULL,
    "typeSgbd" "TypeSGBD" NOT NULL,
    "adresseIp" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "nomBaseDeDonnees" TEXT NOT NULL,
    "nomUtilisateur" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,

    CONSTRAINT "SGBDCible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationStockage" (
    "id" SERIAL NOT NULL,
    "nomDestination" TEXT NOT NULL,
    "cheminLocal" TEXT NOT NULL,
    "cloudProvider" TEXT,
    "cloudBucket" TEXT,
    "cloudApiKey" TEXT,

    CONSTRAINT "DestinationStockage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanSauvegarde" (
    "id" SERIAL NOT NULL,
    "nomPlan" TEXT NOT NULL,
    "frequenceCron" TEXT NOT NULL,
    "typeSauvegarde" TEXT NOT NULL,
    "compressionActivee" BOOLEAN NOT NULL DEFAULT true,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "sgbdCibleId" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,

    CONSTRAINT "PlanSauvegarde_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalSauvegarde" (
    "id" SERIAL NOT NULL,
    "statut" "StatutOperation" NOT NULL,
    "heureDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heureFin" TIMESTAMP(3),
    "dureeSecondes" INTEGER,
    "tailleFichierOctet" BIGINT,
    "cheminFichierLocal" TEXT,
    "messageLog" TEXT,
    "planId" INTEGER NOT NULL,

    CONSTRAINT "JournalSauvegarde_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalRestauration" (
    "id" SERIAL NOT NULL,
    "statut" "StatutOperation" NOT NULL,
    "heureDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heureFin" TIMESTAMP(3),
    "messageLog" TEXT,
    "sauvegardeId" INTEGER NOT NULL,

    CONSTRAINT "JournalRestauration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SGBDCible_nomConnexion_key" ON "SGBDCible"("nomConnexion");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationStockage_nomDestination_key" ON "DestinationStockage"("nomDestination");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSauvegarde_nomPlan_key" ON "PlanSauvegarde"("nomPlan");

-- AddForeignKey
ALTER TABLE "PlanSauvegarde" ADD CONSTRAINT "PlanSauvegarde_sgbdCibleId_fkey" FOREIGN KEY ("sgbdCibleId") REFERENCES "SGBDCible"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSauvegarde" ADD CONSTRAINT "PlanSauvegarde_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "DestinationStockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalSauvegarde" ADD CONSTRAINT "JournalSauvegarde_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PlanSauvegarde"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalRestauration" ADD CONSTRAINT "JournalRestauration_sauvegardeId_fkey" FOREIGN KEY ("sauvegardeId") REFERENCES "JournalSauvegarde"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
