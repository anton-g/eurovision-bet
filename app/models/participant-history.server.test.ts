import {
  buildParticipantHistorySummaries,
  type ParticipantHistoryEntry,
} from "./participant-history.server";

test("buildParticipantHistorySummaries calculates cross-year participant stats", () => {
  const entries: ParticipantHistoryEntry[] = [
    {
      participantId: "a",
      participantKey: "a",
      name: "Anton",
      hidden: false,
      poolId: "pool-2024",
      poolName: "Släkten 2024",
      year: 2024,
      points: 10,
      position: 1,
      swedenDelta: 1,
    },
    {
      participantId: "a",
      participantKey: "a",
      name: "Anton",
      hidden: false,
      poolId: "pool-2025",
      poolName: "Släkten 2025",
      year: 2025,
      points: 6,
      position: 3,
      swedenDelta: 3,
    },
    {
      participantId: "b",
      participantKey: "b",
      name: "Bea",
      hidden: true,
      poolId: "pool-2024",
      poolName: "Släkten 2024",
      year: 2024,
      points: 8,
      position: 2,
      swedenDelta: 0,
    },
  ];

  const summaries = buildParticipantHistorySummaries(entries);
  const anton = summaries.find(
    (participant) => participant.participantId === "a"
  );
  const bea = summaries.find(
    (participant) => participant.participantId === "b"
  );

  expect(anton).toMatchObject({
    hidden: false,
    totalPoints: 16,
    averagePoints: 8,
    averagePosition: 2,
    wins: 1,
    podiums: 2,
    swedenAverageDelta: 2,
    bestYear: {
      year: 2024,
      points: 10,
      position: 1,
    },
    worstYear: {
      year: 2025,
      points: 6,
      position: 3,
    },
  });

  expect(bea).toMatchObject({
    hidden: true,
    totalPoints: 8,
    averagePoints: 8,
    averagePosition: 2,
    wins: 0,
    podiums: 1,
    swedenAverageDelta: 0,
  });
});
