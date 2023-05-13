import type { BettingPool, User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

const bettingPoolFull = Prisma.validator<Prisma.BettingPoolArgs>()({
  include: {
    bets: {
      include: {
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

export async function createBettingPool(
  name: BettingPool["name"],
  ownerId: User["id"]
) {
  return prisma.bettingPool.create({
    data: {
      name,
      ownerId,
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
  return prisma.bet.create({
    data: {
      poolId,
      name,
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
