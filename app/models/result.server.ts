import { prisma } from "~/db.server";

export async function getResult(year: number) {
  return prisma.result.findUnique({
    where: {
      year,
    },
  });
}

export async function updateResult({
  year,
  firstPlaceCountryId,
  secondPlaceCountryId,
  thirdPlaceCountryId,
  fourthPlaceCountryId,
  fifthPlaceCountryId,
  swedenPosition,
}: {
  year: number;
  firstPlaceCountryId: number;
  secondPlaceCountryId: number;
  thirdPlaceCountryId: number;
  fourthPlaceCountryId: number;
  fifthPlaceCountryId: number;
  swedenPosition: number;
}) {
  return prisma.result.upsert({
    create: {
      year,
      firstPlaceCountryId,
      secondPlaceCountryId,
      thirdPlaceCountryId,
      fourthPlaceCountryId,
      fifthPlaceCountryId,
      swedenPosition,
    },
    update: {
      year,
      firstPlaceCountryId,
      secondPlaceCountryId,
      thirdPlaceCountryId,
      fourthPlaceCountryId,
      fifthPlaceCountryId,
      swedenPosition,
    },
    where: {
      year,
    },
  });
}

export async function deleteResult(year: number) {
  return prisma.result.delete({
    where: {
      year,
    },
  });
}
