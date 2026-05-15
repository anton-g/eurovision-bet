import type { BettingPool, User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";
import { getOrCreateParticipant } from "~/models/participant.server";

const bettingPoolFull = Prisma.validator<Prisma.BettingPoolArgs>()({
  include: {
    bets: {
      include: {
        participant: true,
        firstPlace: true,
        secondPlace: true,
        thirdPlace: true,
        fourthPlace: true,
        fifthPlace: true,
      },
    },
  },
});

export type BettingPoolFull = Prisma.BettingPoolGetPayload<
  typeof bettingPoolFull
>;

export async function getUserBettingPools(userId: User["id"]) {
  return prisma.bettingPool.findMany({
    where: {
      ownerId: userId,
    },
  });
}

export async function getPool(id: BettingPool["id"]) {
  return prisma.bettingPool.findFirst({
    where: {
      id,
    },
    ...bettingPoolFull,
  });
}

export async function getAllPools() {
  return prisma.bettingPool.findMany({
    where: {
      name: {
        contains: "Släkten",
      },
    },
    orderBy: {
      year: "desc",
    },
    ...bettingPoolFull,
  });
}

export async function createBettingPool(
  name: BettingPool["name"],
  ownerId: User["id"],
  year: BettingPool["year"]
) {
  return prisma.bettingPool.create({
    data: {
      name,
      ownerId,
      year,
    },
  });
}

export async function deleteBettingPool(
  id: BettingPool["id"],
  userId: User["id"]
) {
  return prisma.bettingPool.deleteMany({
    where: {
      id,
      ownerId: userId,
    },
  });
}

export async function addBet({
  poolId,
  name,
  firstPlaceCountryId,
  secondPlaceCountryId,
  thirdPlaceCountryId,
  fourthPlaceCountryId,
  fifthPlaceCountryId,
  swedenPosition,
}: {
  poolId: string;
  name: string;
  firstPlaceCountryId: number;
  secondPlaceCountryId: number;
  thirdPlaceCountryId: number;
  fourthPlaceCountryId: number;
  fifthPlaceCountryId: number;
  swedenPosition: number;
}) {
  const trimmedName = name.trim();
  const participant = await getOrCreateParticipant(trimmedName);

  const existingBet = await prisma.bet.findFirst({
    where: {
      poolId,
      participantId: participant.id,
    },
  });

  if (existingBet) {
    return null;
  }

  return prisma.bet.create({
    data: {
      poolId,
      name: trimmedName,
      participantId: participant.id,
      firstPlaceCountryId,
      secondPlaceCountryId,
      thirdPlaceCountryId,
      fourthPlaceCountryId,
      fifthPlaceCountryId,
      swedenPosition,
    },
  });
}

export async function deleteBet(id: string) {
  return prisma.bet.delete({
    where: {
      id,
    },
  });
}
