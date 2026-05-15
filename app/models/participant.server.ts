import type { Participant } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";
import { normalizeParticipantName } from "~/models/participant";

const participantHistory = Prisma.validator<Prisma.ParticipantArgs>()({
  include: {
    bets: {
      include: {
        pool: true,
        firstPlace: true,
        secondPlace: true,
        thirdPlace: true,
        fourthPlace: true,
        fifthPlace: true,
      },
    },
  },
});

export type ParticipantHistory = Prisma.ParticipantGetPayload<
  typeof participantHistory
>;

export async function getParticipantOptions() {
  return prisma.participant.findMany({
    where: {
      hidden: false,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getParticipantById(id: Participant["id"]) {
  return prisma.participant.findUnique({
    where: {
      id,
    },
    ...participantHistory,
  });
}

export async function getParticipantsForAdmin() {
  return prisma.participant.findMany({
    select: {
      id: true,
      name: true,
      hidden: true,
      _count: {
        select: {
          bets: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function updateParticipantHidden(
  id: Participant["id"],
  hidden: boolean
) {
  return prisma.participant.update({
    where: {
      id,
    },
    data: {
      hidden,
    },
  });
}

export async function deleteParticipantIfUnused(id: Participant["id"]) {
  const participant = await prisma.participant.findUnique({
    where: {
      id,
    },
    select: {
      _count: {
        select: {
          bets: true,
        },
      },
    },
  });

  if (!participant) {
    return { deleted: false, reason: "Participant not found" };
  }

  if (participant._count.bets > 0) {
    return { deleted: false, reason: "Participant still has bets" };
  }

  await prisma.participant.delete({
    where: {
      id,
    },
  });

  return { deleted: true as const };
}

export async function getOrCreateParticipant(name: string) {
  const trimmedName = name.trim();

  return prisma.participant.upsert({
    where: {
      normalizedName: normalizeParticipantName(trimmedName),
    },
    update: {},
    create: {
      name: trimmedName,
      normalizedName: normalizeParticipantName(trimmedName),
    },
  });
}
