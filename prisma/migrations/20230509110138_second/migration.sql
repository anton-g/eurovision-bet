/*
  Warnings:

  - You are about to drop the `CountryBet` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fifthPlaceCountryId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstPlaceCountryId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fourthPlaceCountryId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondPlaceCountryId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swedenPosition` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thirdPlaceCountryId` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CountryBet";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolId" TEXT NOT NULL,
    "firstPlaceCountryId" INTEGER NOT NULL,
    "secondPlaceCountryId" INTEGER NOT NULL,
    "thirdPlaceCountryId" INTEGER NOT NULL,
    "fourthPlaceCountryId" INTEGER NOT NULL,
    "fifthPlaceCountryId" INTEGER NOT NULL,
    "swedenPosition" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Bet_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "BettingPool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bet_firstPlaceCountryId_fkey" FOREIGN KEY ("firstPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_secondPlaceCountryId_fkey" FOREIGN KEY ("secondPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_thirdPlaceCountryId_fkey" FOREIGN KEY ("thirdPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_fourthPlaceCountryId_fkey" FOREIGN KEY ("fourthPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_fifthPlaceCountryId_fkey" FOREIGN KEY ("fifthPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bet" ("id", "name", "poolId") SELECT "id", "name", "poolId" FROM "Bet";
DROP TABLE "Bet";
ALTER TABLE "new_Bet" RENAME TO "Bet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
