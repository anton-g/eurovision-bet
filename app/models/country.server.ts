import { prisma } from "~/db.server";

export async function getCountries() {
  return prisma.country.findMany();
}
