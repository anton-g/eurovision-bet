import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getParticipantHistorySummaries } from "~/models/participant-history.server";

export const loader = async ({ request }: LoaderArgs) => {
  const participants = (await getParticipantHistorySummaries()).filter(
    (participant) => !participant.hidden
  );

  const byTotalPoints = [...participants].sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.wins - a.wins ||
      a.averagePosition - b.averagePosition
  );
  const byAveragePoints = [...participants].sort(
    (a, b) =>
      b.averagePoints - a.averagePoints ||
      b.totalPoints - a.totalPoints ||
      a.name.localeCompare(b.name)
  );
  const byAveragePosition = [...participants].sort(
    (a, b) =>
      a.averagePosition - b.averagePosition ||
      b.wins - a.wins ||
      a.name.localeCompare(b.name)
  );
  const bySwedenDelta = [...participants]
    .filter((participant) => participant.swedenAverageDelta !== null)
    .sort(
      (a, b) =>
        a.swedenAverageDelta! - b.swedenAverageDelta! ||
        b.totalPoints - a.totalPoints ||
        a.name.localeCompare(b.name)
    );
  const byWins = [...participants].sort(
    (a, b) => b.wins - a.wins || b.totalPoints - a.totalPoints
  );
  const byPodiums = [...participants].sort(
    (a, b) => b.podiums - a.podiums || b.totalPoints - a.totalPoints
  );
  const byWorstAverage = [...participants].sort(
    (a, b) =>
      a.averagePoints - b.averagePoints ||
      b.averagePosition - a.averagePosition ||
      a.name.localeCompare(b.name)
  );

  return json({
    participants,
    leaders: {
      overall: byTotalPoints[0] ?? null,
      average: byAveragePoints[0] ?? null,
      consistency: byAveragePosition[0] ?? null,
      sweden: bySwedenDelta[0] ?? null,
      wins: byWins[0] ?? null,
      roughLuck: byWorstAverage[0] ?? null,
    },
    leaderboards: {
      overall: byTotalPoints,
      average: byAveragePoints,
      sweden: bySwedenDelta,
      wins: byWins,
      podiums: byPodiums,
      worstAverage: byWorstAverage,
    },
  });
};

export default function ParticipantStatsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Deltagarstatistik
          </p>
          <h1 className="text-4xl font-bold">All participants</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Long-run standings across all saved pools and years, including total
            points, average finishes, and Sweden guess accuracy.
          </p>
        </div>
        <Link
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          to="/history"
        >
          Back to history
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <HighlightCard
          title="Overall leader"
          participant={data.leaders.overall}
          detail={
            data.leaders.overall
              ? `${data.leaders.overall.totalPoints} points across ${data.leaders.overall.bets.length} years`
              : undefined
          }
        />
        <HighlightCard
          title="Best average scorer"
          participant={data.leaders.average}
          detail={
            data.leaders.average
              ? `${data.leaders.average.averagePoints} points per year`
              : undefined
          }
        />
        <HighlightCard
          title="Most consistent finisher"
          participant={data.leaders.consistency}
          detail={
            data.leaders.consistency
              ? `${data.leaders.consistency.averagePosition} average place`
              : undefined
          }
        />
        <HighlightCard
          title="Best Sweden guesser"
          participant={data.leaders.sweden}
          detail={
            data.leaders.sweden
              ? `${data.leaders.sweden.swedenAverageDelta} average places off`
              : undefined
          }
        />
        <HighlightCard
          title="Most wins"
          participant={data.leaders.wins}
          detail={
            data.leaders.wins
              ? `${data.leaders.wins.wins} yearly wins`
              : undefined
          }
        />
        <HighlightCard
          title="Roughest average"
          participant={data.leaders.roughLuck}
          detail={
            data.leaders.roughLuck
              ? `${data.leaders.roughLuck.averagePoints} average points`
              : undefined
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LeaderboardCard
          title="Overall standings"
          subtitle="Sorted by total points"
          participants={data.leaderboards.overall}
          value={(participant) => `${participant.totalPoints} pts`}
          secondaryValue={(participant) => `${participant.wins} wins`}
        />
        <LeaderboardCard
          title="Average points"
          subtitle="Who scores highest per year"
          participants={data.leaderboards.average}
          value={(participant) => `${participant.averagePoints} avg pts`}
          secondaryValue={(participant) => `${participant.bets.length} years`}
        />
        <LeaderboardCard
          title="Sweden prediction accuracy"
          subtitle="Lower is better"
          participants={data.leaderboards.sweden}
          value={(participant) => `${participant.swedenAverageDelta} avg off`}
          secondaryValue={(participant) => `${participant.bets.length} years`}
        />
        <LeaderboardCard
          title="Podium machine"
          subtitle="Most top-3 finishes"
          participants={data.leaderboards.podiums}
          value={(participant) => `${participant.podiums} podiums`}
          secondaryValue={(participant) =>
            `${participant.averagePosition} avg place`
          }
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Years</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Avg points</th>
              <th className="px-4 py-3">Avg place</th>
              <th className="px-4 py-3">Wins</th>
              <th className="px-4 py-3">Podiums</th>
              <th className="px-4 py-3">Sweden avg delta</th>
              <th className="px-4 py-3">Best year</th>
              <th className="px-4 py-3">Worst year</th>
            </tr>
          </thead>
          <tbody>
            {data.participants
              .slice()
              .sort((a, b) => b.totalPoints - a.totalPoints)
              .map((participant) => (
                <tr
                  key={participant.participantKey}
                  className="border-t border-gray-100"
                >
                  <td className="px-4 py-3 font-medium">
                    <ParticipantLink
                      participantId={participant.participantId}
                      name={participant.name}
                    />
                  </td>
                  <td className="px-4 py-3">{participant.bets.length}</td>
                  <td className="px-4 py-3">{participant.totalPoints}</td>
                  <td className="px-4 py-3">{participant.averagePoints}</td>
                  <td className="px-4 py-3">{participant.averagePosition}</td>
                  <td className="px-4 py-3">{participant.wins}</td>
                  <td className="px-4 py-3">{participant.podiums}</td>
                  <td className="px-4 py-3">
                    {participant.swedenAverageDelta ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {participant.bestYear
                      ? `${participant.bestYear.year}: ${participant.bestYear.points} pts (#${participant.bestYear.position})`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {participant.worstYear
                      ? `${participant.worstYear.year}: ${participant.worstYear.points} pts (#${participant.worstYear.position})`
                      : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  participant,
  detail,
}: {
  title: string;
  participant: {
    participantId: string;
    name: string;
  } | null;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
        {title}
      </p>
      <div className="mt-3 text-2xl font-bold text-gray-900">
        {participant ? (
          <ParticipantLink
            participantId={participant.participantId}
            name={participant.name}
          />
        ) : (
          "-"
        )}
      </div>
      {detail ? <p className="mt-2 text-sm text-gray-600">{detail}</p> : null}
    </div>
  );
}

function LeaderboardCard({
  title,
  subtitle,
  participants,
  value,
  secondaryValue,
}: {
  title: string;
  subtitle: string;
  participants: Array<{
    participantId: string;
    participantKey: string;
    name: string;
  }>;
  value: (participant: any) => string;
  secondaryValue: (participant: any) => string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      <ol className="mt-4 space-y-3">
        {participants.slice(0, 5).map((participant, index) => (
          <li
            key={participant.participantKey}
            className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-b-0"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                #{index + 1}
              </p>
              <div className="font-medium text-gray-900">
                <ParticipantLink
                  participantId={participant.participantId}
                  name={participant.name}
                />
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>{value(participant)}</div>
              <div>{secondaryValue(participant)}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ParticipantLink({
  participantId,
  name,
}: {
  participantId: string;
  name: string;
}) {
  return (
    <Link
      className="text-current no-underline hover:opacity-70"
      to={`/participants/${participantId}`}
    >
      {name}
    </Link>
  );
}
