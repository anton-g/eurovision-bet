-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BettingPool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "BettingPool_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Bet_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "BettingPool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CountryBet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    CONSTRAINT "CountryBet_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "CountryResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    "resultId" TEXT NOT NULL,
    CONSTRAINT "CountryResult_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CountryResult_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Albania', 'AL');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Armenia', 'AM');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Australia', 'AU');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Austria', 'AT');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Azerbaijan', 'AZ');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Belgium', 'BE');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Croatia', 'HR');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Cyprus', 'CY');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Czechia', 'CZ');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Denmark', 'DK');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Estonia', 'EE');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Finland', 'FI');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('France', 'FR');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Georgia', 'GE');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Germany', 'DE');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Greece', 'GR');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Iceland', 'IS');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Ireland', 'IE');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Israel', 'IL');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Italy', 'IT');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Latvia', 'LV');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Lithuania', 'LT');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Malta', 'MT');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Moldova', 'MD');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Netherlands', 'NL');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Norway', 'NO');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Poland', 'PL');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Portugal', 'PT');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Romania', 'RO');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('San Marino', 'SM');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Serbia', 'RS');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Slovenia', 'SI');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Spain', 'ES');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Sweden', 'SE');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Switzerland', 'CH');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('Ukraine', 'UA');

INSERT INTO
    "Country" ("name", "code")
VALUES
    ('United Kingdom', 'GB');