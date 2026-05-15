import { getAllPools } from "~/models/betting-pool.server";
import { getResult } from "~/models/result.server";
import { calculatePoints, getCompetitionRanks } from "~/utils";

export type ParticipantHistoryEntry = {
  participantId: string;
  participantKey: string;
  name: string;
  hidden: boolean;
  poolId: string;
  poolName: string;
  year: number;
  points: number;
  position: number;
  swedenDelta: number | null;
};

export type ParticipantHistorySummary = {
  participantId: string;
  participantKey: string;
  name: string;
  hidden: boolean;
  bets: ParticipantHistoryEntry[];
  totalPoints: number;
  averagePoints: number;
  averagePosition: number;
  wins: number;
  podiums: number;
  swedenAverageDelta: number | null;
  bestYear: ParticipantHistoryEntry | null;
  worstYear: ParticipantHistoryEntry | null;
};

export async function getParticipantHistorySummaries() {
  const pools = await getAllPools();

  const entries = await Promise.all(
    pools.flatMap(async (pool) => {
      const year = pool.year || 2024;
      const result = await getResult(year);
      const bets = calculatePoints(pool.bets, result).sort(
        (a, b) => b.points - a.points
      );
      const positions = getCompetitionRanks(bets);

      return bets.map((bet, index) => ({
        participantId: bet.participantId,
        participantKey: bet.participantId ?? bet.name,
        name: bet.participant?.name ?? bet.name,
        hidden: bet.participant?.hidden ?? false,
        poolId: bet.poolId,
        poolName: pool.name,
        year,
        points: bet.points,
        position: positions[index],
        swedenDelta:
          result === null
            ? null
            : Math.abs(result.swedenPosition - bet.swedenPosition),
      }));
    })
  );

  return buildParticipantHistorySummaries(entries.flatMap((group) => group));
}

export function buildParticipantHistorySummaries(
  entries: ParticipantHistoryEntry[]
): ParticipantHistorySummary[] {
  const grouped = groupBy(entries, "participantKey");

  return Object.values(grouped)
    .map((participantEntries) => {
      const bets = [...participantEntries].sort((a, b) => a.year - b.year);
      const totalPoints = bets.reduce((sum, bet) => sum + bet.points, 0);
      const totalPositions = bets.reduce((sum, bet) => sum + bet.position, 0);
      const swedenDeltas = bets
        .map((bet) => bet.swedenDelta)
        .filter((delta): delta is number => delta !== null);

      return {
        participantId: bets[0].participantId,
        participantKey: bets[0].participantKey,
        name: bets[0].name,
        hidden: bets[0].hidden,
        bets,
        totalPoints,
        averagePoints: round(totalPoints / bets.length),
        averagePosition: round(totalPositions / bets.length),
        wins: bets.filter((bet) => bet.position === 1).length,
        podiums: bets.filter((bet) => bet.position <= 3).length,
        swedenAverageDelta:
          swedenDeltas.length > 0
            ? round(
                swedenDeltas.reduce((sum, delta) => sum + delta, 0) /
                  swedenDeltas.length
              )
            : null,
        bestYear:
          [...bets].sort(
            (a, b) =>
              b.points - a.points || a.position - b.position || b.year - a.year
          )[0] ?? null,
        worstYear:
          [...bets].sort(
            (a, b) =>
              a.points - b.points || b.position - a.position || b.year - a.year
          )[0] ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = item[key] as unknown as string;
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

function round(value: number) {
  return Number(value.toFixed(1));
}
