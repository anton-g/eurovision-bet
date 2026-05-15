import type { Bet, Result } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { getPool as getBettingPool } from "~/models/betting-pool.server";
import { getCountries } from "~/models/country.server";
import { getParticipantById } from "~/models/participant.server";
import { getResult } from "~/models/result.server";
import { calculatePoints, getCompetitionRanks } from "~/utils";
import { formatCountryLabel } from "~/utils/country";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.participantId, "participantId not found");

  const participant = await getParticipantById(params.participantId);
  if (!participant) {
    throw new Response("Not Found", { status: 404 });
  }

  const countries = await getCountries();
  const countriesById = new Map(
    countries.map((country) => [country.id, country])
  );
  const uniquePoolIds = [...new Set(participant.bets.map((bet) => bet.poolId))];

  const entries = (
    await Promise.all(
      uniquePoolIds.map(async (poolId) => {
        const pool = await getBettingPool(poolId);
        if (!pool) {
          return null;
        }

        const result = await getResult(pool.year || 2024);
        const bets = calculatePoints(pool.bets, result).sort(
          (a, b) => b.points - a.points
        );
        const positions = getCompetitionRanks(bets);
        const participantBetIndex = bets.findIndex(
          (bet) => bet.participantId === participant.id
        );

        if (participantBetIndex < 0) {
          return null;
        }

        const participantBet = bets[participantBetIndex];

        return {
          betId: participantBet.id,
          poolId: pool.id,
          poolName: pool.name,
          year: pool.year || 2024,
          position: positions[participantBetIndex],
          points: participantBet.points,
          firstPlace: {
            name: participantBet.firstPlace.name,
            code: participantBet.firstPlace.code,
            correct: getBetResult(
              participantBet,
              result,
              "firstPlaceCountryId"
            ),
          },
          secondPlace: {
            name: participantBet.secondPlace.name,
            code: participantBet.secondPlace.code,
            correct: getBetResult(
              participantBet,
              result,
              "secondPlaceCountryId"
            ),
          },
          thirdPlace: {
            name: participantBet.thirdPlace.name,
            code: participantBet.thirdPlace.code,
            correct: getBetResult(
              participantBet,
              result,
              "thirdPlaceCountryId"
            ),
          },
          fourthPlace: {
            name: participantBet.fourthPlace.name,
            code: participantBet.fourthPlace.code,
            correct: getBetResult(
              participantBet,
              result,
              "fourthPlaceCountryId"
            ),
          },
          fifthPlace: {
            name: participantBet.fifthPlace.name,
            code: participantBet.fifthPlace.code,
            correct: getBetResult(
              participantBet,
              result,
              "fifthPlaceCountryId"
            ),
          },
          swedenPosition: {
            value: participantBet.swedenPosition,
            correct: getBetResult(participantBet, result, "swedenPosition"),
          },
          actualResult: result
            ? {
                firstPlace:
                  countriesById.get(result.firstPlaceCountryId) ?? null,
                secondPlace:
                  countriesById.get(result.secondPlaceCountryId) ?? null,
                thirdPlace:
                  countriesById.get(result.thirdPlaceCountryId) ?? null,
                fourthPlace:
                  countriesById.get(result.fourthPlaceCountryId) ?? null,
                fifthPlace:
                  countriesById.get(result.fifthPlaceCountryId) ?? null,
                swedenPosition: result.swedenPosition,
              }
            : null,
        };
      })
    )
  )
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => b.year - a.year || a.poolName.localeCompare(b.poolName));

  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
  const bestEntry = [...entries].sort(
    (a, b) => b.points - a.points || a.position - b.position
  )[0];
  const worstEntry = [...entries].sort(
    (a, b) => a.points - b.points || b.position - a.position
  )[0];

  return json({
    participant: {
      id: participant.id,
      name: participant.name,
    },
    entries,
    stats: {
      totalBets: entries.length,
      averagePoints:
        entries.length > 0
          ? Number((totalPoints / entries.length).toFixed(1))
          : 0,
      yearsParticipated: entries.map((entry) => entry.year),
      bestEntry,
      worstEntry,
    },
  });
};

export default function ParticipantDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Deltagarhistorik
        </p>
        <h1 className="text-4xl font-bold">{data.participant.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Antal år" value={data.stats.totalBets} />
        <StatCard label="Snittpoäng" value={data.stats.averagePoints} />
        <StatCard
          label="Bästa år"
          value={data.stats.bestEntry ? `${data.stats.bestEntry.year}` : "-"}
          detail={
            data.stats.bestEntry
              ? `${data.stats.bestEntry.points} poäng, plats ${data.stats.bestEntry.position}`
              : undefined
          }
        />
        <StatCard
          label="Sämsta år"
          value={data.stats.worstEntry ? `${data.stats.worstEntry.year}` : "-"}
          detail={
            data.stats.worstEntry
              ? `${data.stats.worstEntry.points} poäng, plats ${data.stats.worstEntry.position}`
              : undefined
          }
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">År</th>
              <th className="px-4 py-3">Pool</th>
              <th className="px-4 py-3">Placering</th>
              <th className="px-4 py-3">Poäng</th>
              <th className="px-4 py-3">1</th>
              <th className="px-4 py-3">2</th>
              <th className="px-4 py-3">3</th>
              <th className="px-4 py-3">4</th>
              <th className="px-4 py-3">5</th>
              <th className="px-4 py-3">🇸🇪</th>
              <th className="px-4 py-3">Resultat</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr
                key={entry.betId}
                className="border-t border-gray-100 align-top"
              >
                <td className="px-4 py-3 font-medium">{entry.year}</td>
                <td className="px-4 py-3">
                  <Link
                    className="text-blue-600 underline"
                    to={`/share/${entry.poolId}`}
                  >
                    {entry.poolName}
                  </Link>
                </td>
                <td className="px-4 py-3">{entry.position}</td>
                <td className="px-4 py-3">{entry.points}</td>
                <Cell correct={entry.firstPlace.correct}>
                  {formatCountryLabel(entry.firstPlace)}
                </Cell>
                <Cell correct={entry.secondPlace.correct}>
                  {formatCountryLabel(entry.secondPlace)}
                </Cell>
                <Cell correct={entry.thirdPlace.correct}>
                  {formatCountryLabel(entry.thirdPlace)}
                </Cell>
                <Cell correct={entry.fourthPlace.correct}>
                  {formatCountryLabel(entry.fourthPlace)}
                </Cell>
                <Cell correct={entry.fifthPlace.correct}>
                  {formatCountryLabel(entry.fifthPlace)}
                </Cell>
                <Cell correct={entry.swedenPosition.correct}>
                  {entry.swedenPosition.value}
                </Cell>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {entry.actualResult ? (
                    <div className="space-y-1">
                      <div>
                        1.{" "}
                        {entry.actualResult.firstPlace
                          ? formatCountryLabel(entry.actualResult.firstPlace)
                          : "N/A"}
                        , 2.{" "}
                        {entry.actualResult.secondPlace
                          ? formatCountryLabel(entry.actualResult.secondPlace)
                          : "N/A"}
                        , 3.{" "}
                        {entry.actualResult.thirdPlace
                          ? formatCountryLabel(entry.actualResult.thirdPlace)
                          : "N/A"}
                      </div>
                      <div>
                        4.{" "}
                        {entry.actualResult.fourthPlace
                          ? formatCountryLabel(entry.actualResult.fourthPlace)
                          : "N/A"}
                        , 5.{" "}
                        {entry.actualResult.fifthPlace
                          ? formatCountryLabel(entry.actualResult.fifthPlace)
                          : "N/A"}
                        , 🇸🇪 {entry.actualResult.swedenPosition}
                      </div>
                    </div>
                  ) : (
                    "Inget resultat ännu"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {detail ? <p className="mt-2 text-sm text-gray-600">{detail}</p> : null}
    </div>
  );
}

const alternatives = [
  "firstPlaceCountryId",
  "secondPlaceCountryId",
  "thirdPlaceCountryId",
  "fourthPlaceCountryId",
  "fifthPlaceCountryId",
  "swedenPosition",
] as const;

type BetCorrectness = "yes" | "no" | "almost";

function getBetResult(
  bet: Bet,
  result: Result | null,
  column: (typeof alternatives)[number]
): BetCorrectness {
  if (!result) {
    return "no";
  }

  if (column === "swedenPosition") {
    return result[column] === bet[column] ? "yes" : "no";
  }

  if (result[column] === bet[column]) {
    return "yes";
  }

  if (alternatives.some((alternative) => result[alternative] === bet[column])) {
    return "almost";
  }

  return "no";
}

function Cell({
  correct,
  children,
}: {
  correct: BetCorrectness;
  children: React.ReactNode;
}) {
  let classes = "";
  if (correct === "yes") {
    classes = "bg-green-300";
  } else if (correct === "almost") {
    classes = "bg-yellow-300";
  } else {
    classes = "bg-red-300";
  }

  return <td className={`px-4 py-3 ${classes}`}>{children}</td>;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Deltagaren hittades inte</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
