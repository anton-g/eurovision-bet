import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getParticipantHistorySummaries } from "~/models/participant-history.server";

export const loader = async ({ request }: LoaderArgs) => {
  const participants = await getParticipantHistorySummaries();

  return json({ participants });
};

export default function PoolsPage() {
  const data = useLoaderData<typeof loader>();

  const years = Array.from(
    new Set(
      data.participants.flatMap((participant) =>
        participant.bets.map((bet) => bet.year)
      )
    )
  ).sort((a, b) => a - b);
  const latestYear = years.at(-1);

  const maxPositionByYear = new Map(
    years.map((year) => [
      year,
      Math.max(
        ...data.participants
          .flatMap((participant) => participant.bets)
          .filter((bet) => bet.year === year)
          .map((bet) => bet.position)
      ),
    ])
  );

  const participants = data.participants
    .map((participant) => {
      const betsByYear = new Map(
        participant.bets.map((bet) => [bet.year, bet] as const)
      );
      const latestBet = latestYear ? betsByYear.get(latestYear) : undefined;

      return {
        ...participant,
        betsByYear,
        latestBet,
      };
    })
    .filter((participant) => participant.bets.length > 0)
    .sort((a, b) => {
      if (a.latestBet && b.latestBet) {
        return (
          a.latestBet.position - b.latestBet.position ||
          b.latestBet.points - a.latestBet.points ||
          a.averagePosition - b.averagePosition ||
          a.name.localeCompare(b.name)
        );
      }

      if (a.latestBet) {
        return -1;
      }

      if (b.latestBet) {
        return 1;
      }

      return (
        a.averagePosition - b.averagePosition || a.name.localeCompare(b.name)
      );
    });

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Historiska placeringar</h2>
        <Link
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          to="/participants/stats"
        >
          Participant stats
        </Link>
      </div>
      {participants.length > 0 ? (
        <>
          <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
              Better placements are greener
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
              Mid-table stays amber
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-900">
              Lower placements turn red
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              Empty cells mean no entry that year
            </span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-[0.16em] text-gray-500">
                  <th className="sticky left-0 z-20 border-b border-gray-200 bg-gray-50 px-4 py-3 text-left">
                    Participant
                  </th>
                  {years.map((year) => (
                    <th
                      key={year}
                      className="border-b border-gray-200 px-3 py-3 text-center"
                    >
                      {year}
                    </th>
                  ))}
                  <th className="border-b border-gray-200 px-3 py-3 text-center">
                    Avg
                  </th>
                  <th className="border-b border-gray-200 px-3 py-3 text-center">
                    Wins
                  </th>
                  <th className="border-b border-gray-200 px-3 py-3 text-center">
                    Latest
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => {
                  const rowClass =
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/60";

                  return (
                    <tr key={participant.participantKey} className={rowClass}>
                      <td
                        className={`${rowClass} sticky left-0 z-10 border-b border-gray-100 px-4 py-3 align-top`}
                      >
                        <div className="min-w-[12rem]">
                          {participant.participantId ? (
                            <Link
                              className="font-medium text-current no-underline hover:opacity-70"
                              to={`/participants/${participant.participantId}`}
                            >
                              {participant.name}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {participant.name}
                            </span>
                          )}
                          <div className="mt-1 text-xs text-gray-500">
                            {participant.totalPoints} pts total over{" "}
                            {participant.bets.length} years
                          </div>
                        </div>
                      </td>
                      {years.map((year) => {
                        const bet = participant.betsByYear.get(year);

                        return (
                          <td
                            key={year}
                            className="border-b border-gray-100 px-2 py-2 text-center"
                          >
                            {bet ? (
                              <div
                                className="mx-auto flex min-w-[4.75rem] flex-col rounded-xl border px-2 py-2 shadow-sm"
                                style={getPlacementCellStyle(
                                  bet.position,
                                  maxPositionByYear.get(year) ?? bet.position
                                )}
                              >
                                <span className="text-base font-semibold leading-none">
                                  #{bet.position}
                                </span>
                                <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] opacity-75">
                                  {bet.points} pts
                                </span>
                              </div>
                            ) : (
                              <div className="mx-auto min-w-[4.75rem] rounded-xl border border-dashed border-gray-200 bg-gray-50 px-2 py-2 text-xs text-gray-400">
                                --
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-gray-100 px-3 py-3 text-center font-medium text-gray-700">
                        #{participant.averagePosition}
                      </td>
                      <td className="border-b border-gray-100 px-3 py-3 text-center font-medium text-gray-700">
                        {participant.wins}
                      </td>
                      <td className="border-b border-gray-100 px-3 py-3 text-center font-medium text-gray-700">
                        {participant.latestBet
                          ? `#${participant.latestBet.position}`
                          : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            The history view uses a placement heatmap instead of crossing lines,
            which keeps ties and participant labels readable.
          </p>
        </>
      ) : null}
      {participants.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No participant history is available yet.
        </p>
      ) : null}
    </div>
  );
}

function getPlacementCellStyle(position: number, maxPosition: number) {
  const ratio =
    maxPosition <= 1 ? 0 : Math.min((position - 1) / (maxPosition - 1), 1);
  const hue = 145 - ratio * 145;

  return {
    backgroundColor: `hsl(${hue} 75% 90%)`,
    borderColor: `hsl(${hue} 60% 76%)`,
    color: `hsl(${hue} 55% 22%)`,
  };
}
