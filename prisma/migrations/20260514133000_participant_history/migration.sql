/*
  Warnings:

  - Added the required column `participantId` to the `Bet` table without a default value. This migration backfills participant rows from existing bet names and preserves all existing bet rows.

*/
PRAGMA foreign_keys=OFF;

CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL
);

CREATE UNIQUE INDEX "Participant_normalizedName_key" ON "Participant"("normalizedName");

WITH RECURSIVE "normalized_bets"("id", "name", "normalizedName") AS (
    SELECT
        "id",
        trim("name"),
        lower(trim("name"))
    FROM "Bet"
    UNION ALL
    SELECT
        "id",
        "name",
        replace("normalizedName", '  ', ' ')
    FROM "normalized_bets"
    WHERE instr("normalizedName", '  ') > 0
),
"resolved_bets" AS (
    SELECT "id", "name", "normalizedName"
    FROM "normalized_bets"
    WHERE instr("normalizedName", '  ') = 0
),
"participant_rows"("id", "name", "normalizedName") AS (
    SELECT
        lower(hex(randomblob(16))),
        MIN("name"),
        "normalizedName"
    FROM "resolved_bets"
    GROUP BY "normalizedName"
)
INSERT INTO "Participant" ("id", "name", "normalizedName")
SELECT "id", "name", "normalizedName"
FROM "participant_rows";

CREATE TABLE "new_Bet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "firstPlaceCountryId" INTEGER NOT NULL,
    "secondPlaceCountryId" INTEGER NOT NULL,
    "thirdPlaceCountryId" INTEGER NOT NULL,
    "fourthPlaceCountryId" INTEGER NOT NULL,
    "fifthPlaceCountryId" INTEGER NOT NULL,
    "swedenPosition" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Bet_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "BettingPool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bet_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_firstPlaceCountryId_fkey" FOREIGN KEY ("firstPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_secondPlaceCountryId_fkey" FOREIGN KEY ("secondPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_thirdPlaceCountryId_fkey" FOREIGN KEY ("thirdPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_fourthPlaceCountryId_fkey" FOREIGN KEY ("fourthPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_fifthPlaceCountryId_fkey" FOREIGN KEY ("fifthPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Bet_poolId_participantId_key" ON "new_Bet"("poolId", "participantId");

WITH RECURSIVE "normalized_bets"("id", "normalizedName") AS (
    SELECT
        "id",
        lower(trim("name"))
    FROM "Bet"
    UNION ALL
    SELECT
        "id",
        replace("normalizedName", '  ', ' ')
    FROM "normalized_bets"
    WHERE instr("normalizedName", '  ') > 0
),
"resolved_bets" AS (
    SELECT "id", "normalizedName"
    FROM "normalized_bets"
    WHERE instr("normalizedName", '  ') = 0
)
INSERT INTO "new_Bet" (
    "id",
    "poolId",
    "participantId",
    "firstPlaceCountryId",
    "secondPlaceCountryId",
    "thirdPlaceCountryId",
    "fourthPlaceCountryId",
    "fifthPlaceCountryId",
    "swedenPosition",
    "name"
)
SELECT
    bet."id",
    bet."poolId",
    participant."id",
    bet."firstPlaceCountryId",
    bet."secondPlaceCountryId",
    bet."thirdPlaceCountryId",
    bet."fourthPlaceCountryId",
    bet."fifthPlaceCountryId",
    bet."swedenPosition",
    bet."name"
FROM "Bet" AS bet
JOIN "resolved_bets" AS resolved ON resolved."id" = bet."id"
JOIN "Participant" AS participant ON participant."normalizedName" = resolved."normalizedName";

CREATE TABLE "_BetCountInvariant" (
    "difference" INTEGER NOT NULL CHECK ("difference" = 0)
);

INSERT INTO "_BetCountInvariant" ("difference")
SELECT
    (SELECT COUNT(*) FROM "Bet") - (SELECT COUNT(*) FROM "new_Bet");

DROP TABLE "_BetCountInvariant";
DROP TABLE "Bet";
ALTER TABLE "new_Bet" RENAME TO "Bet";
CREATE INDEX "Bet_participantId_idx" ON "Bet"("participantId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
