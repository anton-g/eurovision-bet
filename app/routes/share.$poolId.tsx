import type { Bet, Country, Result } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { ReactNode } from "react";
import invariant from "tiny-invariant";
import { getPool as getBettingPool } from "~/models/betting-pool.server";
import { getCountries } from "~/models/country.server";
import { getResult } from "~/models/result.server";
import { calculatePoints, getCompetitionRanks } from "~/utils";
import { formatCountryLabel } from "~/utils/country";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.poolId, "poolId not found");

  const pool = await getBettingPool(params.poolId);
  if (!pool) {
    throw new Response("Not Found", { status: 404 });
  }

  const result = await getResult(pool.year || 2024);

  const bets = calculatePoints(pool.bets, result).sort(
    (a, b) => b.points - a.points
  );
  const positions = getCompetitionRanks(bets);

  const simulatedResult = simulateResult(pool.bets, await getCountries());
  const simulatedResultEntries = Object.values(simulatedResult).sort(
    (a, b) => b.score - a.score
  );
  const simulatedResultPositions = getCompetitionRanks(
    simulatedResultEntries.map((country) => ({ points: country.score }))
  );

  const url = new URL(request.url);
  const compareId = url.searchParams.get("compare");

  let betsWithCompare: (ReturnType<typeof calculatePoints>[0] & {
    position: number;
    compare?: { points: number; position: number };
  })[] = bets.map((bet, index) => ({ ...bet, position: positions[index] }));
  if (compareId) {
    const comparePool = await getBettingPool(compareId);
    if (!comparePool) {
      throw new Response("Not Found", { status: 404 });
    }

    const compareResult = await getResult(comparePool.year || 2024);
    const compareBets = calculatePoints(comparePool.bets, compareResult).sort(
      (a, b) => b.points - a.points
    );
    const comparePositions = getCompetitionRanks(compareBets);

    betsWithCompare = betsWithCompare.map((bet) => {
      const compareBetIndex = compareBets.findIndex(
        (x) => getParticipantKey(x) === getParticipantKey(bet)
      );
      const compareBet = compareBets[compareBetIndex];

      return {
        ...bet,
        compare: compareBet
          ? {
              points: compareBet.points,
              position: comparePositions[compareBetIndex],
            }
          : undefined,
      };
    });
  }

  return json({
    pool,
    bets: betsWithCompare,
    result,
    simulatedResult: simulatedResultEntries.map((country, index) => ({
      ...country,
      position: simulatedResultPositions[index],
    })),
  });
};

export default function PoolDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const showResult = Boolean(data.result);

  const showComparison = Boolean(data.bets.some((x) => x.compare));

  return (
    <div className="mx-auto max-w-fit p-3 pb-16">
      <div className="mx-auto mt-20 flex h-full w-full max-w-lg flex-col items-center">
        <div className="relative flex flex-col pb-4">
          <div className="relative">
            <img
              className=" max-h-64 object-contain"
              src="/eurovision_logo_dont_sue_me.png"
              alt="Eurovision Song Contest Logo"
            />
            <p className="absolute -left-10 -top-5 -rotate-12 text-2xl font-black text-violet-600">
              SLÄKTEN GISSAR
            </p>
          </div>
        </div>
      </div>
      <h4 className="mb-16 text-center text-3xl font-bold">{data.pool.year}</h4>
      <div className="relative max-w-fit overflow-x-auto">
        {showComparison && (
          <p className="text-xs text-gray-500">
            (Förändring från förra årets resultat i parantes)
          </p>
        )}
        <table className="text-center text-sm font-light">
          <thead className="border-b font-medium dark:border-neutral-500">
            <tr>
              <th className="px-3 py-2 text-left"></th>
              <th scope="col" className="px-3 py-2 text-left">
                Namn
              </th>
              <th scope="col" className="px-3 py-2">
                Poäng
              </th>
              <th scope="col" className="px-3 py-2">
                1
              </th>
              <th scope="col" className="px-3 py-2">
                2
              </th>
              <th scope="col" className="px-3 py-2">
                3
              </th>
              <th scope="col" className="px-3 py-2">
                4
              </th>
              <th scope="col" className="px-3 py-2">
                5
              </th>
              <th scope="col" className="px-3 py-2">
                🇸🇪
              </th>
            </tr>
          </thead>
          <tbody>
            {data.bets.map((bet) => (
              <tr key={bet.id} className="border-b dark:border-neutral-500">
                <td className="whitespace-nowrap px-6 py-2 text-left">
                  {bet.position}
                  <ComparePosition
                    position={bet.position}
                    comparePosition={bet.compare?.position}
                  />
                </td>
                <NameCell showResult={showResult} position={bet.position}>
                  {bet.participantId ? (
                    <Link
                      className="text-current no-underline hover:opacity-70"
                      to={`/participants/${bet.participantId}`}
                    >
                      {getParticipantDisplayName(bet)}
                    </Link>
                  ) : (
                    getParticipantDisplayName(bet)
                  )}
                </NameCell>
                <td className="whitespace-nowrap px-6 py-2 text-left">
                  {bet.points}
                  <ComparePoints
                    points={bet.points}
                    comparePoints={bet.compare?.points}
                  />
                </td>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "firstPlaceCountryId"
                  )}
                >
                  {formatCountryLabel(bet.firstPlace)}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "secondPlaceCountryId"
                  )}
                >
                  {formatCountryLabel(bet.secondPlace)}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "thirdPlaceCountryId"
                  )}
                >
                  {formatCountryLabel(bet.thirdPlace)}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "fourthPlaceCountryId"
                  )}
                >
                  {formatCountryLabel(bet.fourthPlace)}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "fifthPlaceCountryId"
                  )}
                >
                  {formatCountryLabel(bet.fifthPlace)}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(bet, data.result, "swedenPosition")}
                >
                  {bet.swedenPosition}
                </Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mx-auto mt-16 flex flex-wrap justify-around">
        <div className="mb-11 w-fit">
          <h3 className="mb-2 font-bold">Poängräkning</h3>
          <ul>
            <li>1an på rätt plats: 4p</li>
            <li>2-5 på rätt plats: 2p</li>
            <li>Med i topp 5 men på fel plats: 1p</li>
            <li>Sveriges placering korrekt: 3p</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-bold">Simulerat resultat</h3>
          <p className="mb-3" style={{ maxWidth: 235 }}>
            Om våra gissningar hade gett poängen 12-10-8-6-4 så hade detta varit
            resultatet:
          </p>
          <div className="relative max-w-fit overflow-x-auto">
            <table className="text-center text-sm font-light">
              <thead className="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left">
                    Land
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Poäng
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.simulatedResult.map((country) => (
                  <tr
                    key={country.name}
                    className="border-b dark:border-neutral-500"
                  >
                    <NameCell
                      showResult={showResult}
                      position={country.position}
                    >
                      {country.name}
                    </NameCell>
                    <td className="whitespace-nowrap px-6 py-2">
                      {country.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparePoints({
  points,
  comparePoints,
}: {
  points: number;
  comparePoints?: number;
}) {
  if (!comparePoints) return null;
  const diff = points - comparePoints;
  const isPositiveDiff = diff > 0;
  const textDiff = isPositiveDiff ? `+${diff}` : diff;

  return (
    <span
      className={
        isPositiveDiff ? "text-xs text-green-600" : "text-xs text-red-600"
      }
    >
      {" "}
      ({textDiff})
    </span>
  );
}

function ComparePosition({
  position,
  comparePosition,
}: {
  position: number;
  comparePosition?: number;
}) {
  if (!comparePosition) return null;
  const diff = comparePosition - position;

  if (diff === 0) {
    return <span className={"text-xs text-green-600"}> (0 -)</span>;
  }

  const isPositiveDiff = diff > 0;
  const textDiff = isPositiveDiff ? `${diff} ↗` : `${Math.abs(diff)} ↘`;

  return (
    <span
      className={
        isPositiveDiff ? "text-xs text-green-600" : "text-xs text-red-600"
      }
    >
      {" "}
      ({textDiff})
    </span>
  );
}

const NameCell = ({
  showResult,
  position,
  children,
}: {
  showResult: boolean;
  position: number;
  children: ReactNode;
}) => {
  const suffix =
    position === 1
      ? " 🥇"
      : position === 2
      ? " 🥈"
      : position === 3
      ? " 🥉"
      : "";

  return (
    <td className="whitespace-nowrap px-6 py-2 text-left font-medium">
      {children}
      {showResult && suffix}
    </td>
  );
};

const Cell = ({
  showResult,
  correct,
  children,
}: {
  showResult: boolean;
  correct: "yes" | "no" | "almost";
  children: ReactNode;
}) => {
  let classes = "";
  if (showResult) {
    if (correct === "yes") {
      classes = "bg-green-300";
    } else if (correct === "almost") {
      classes = "bg-yellow-300";
    } else {
      classes = "bg-red-300";
    }
  }

  return (
    <td className={`whitespace-nowrap px-6 py-2 ${classes}`}>{children}</td>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Pool not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

const alternatives = [
  "firstPlaceCountryId",
  "secondPlaceCountryId",
  "thirdPlaceCountryId",
  "fourthPlaceCountryId",
  "fifthPlaceCountryId",
  "swedenPosition",
] as const;
const getBetResult = (
  bet: Bet,
  result: Result | null,
  column: (typeof alternatives)[number]
) => {
  if (!result) {
    return "no";
  }

  if (column === "swedenPosition") {
    if (result[column] === bet[column]) {
      return "yes";
    }

    return "no";
  }

  if (result[column] === bet[column]) {
    return "yes";
  }

  if (alternatives.some((alternative) => result[alternative] === bet[column])) {
    return "almost";
  }

  return "no";
};

const simulateResult = (bets: Bet[], countries: Country[]) => {
  return bets.reduce((acc, cur) => {
    if (!acc[cur.firstPlaceCountryId]) {
      acc[cur.firstPlaceCountryId] = {
        name:
          countries.find((x) => x.id === cur.firstPlaceCountryId)?.name ??
          "N/A",
        score: 0,
      };
    }

    acc[cur.firstPlaceCountryId].score += 12;

    if (!acc[cur.secondPlaceCountryId]) {
      acc[cur.secondPlaceCountryId] = {
        name:
          countries.find((x) => x.id === cur.secondPlaceCountryId)?.name ??
          "N/A",
        score: 0,
      };
    }

    acc[cur.secondPlaceCountryId].score += 10;

    if (!acc[cur.thirdPlaceCountryId]) {
      acc[cur.thirdPlaceCountryId] = {
        name:
          countries.find((x) => x.id === cur.thirdPlaceCountryId)?.name ??
          "N/A",
        score: 0,
      };
    }

    acc[cur.thirdPlaceCountryId].score += 8;

    if (!acc[cur.fourthPlaceCountryId]) {
      acc[cur.fourthPlaceCountryId] = {
        name:
          countries.find((x) => x.id === cur.fourthPlaceCountryId)?.name ??
          "N/A",
        score: 0,
      };
    }

    acc[cur.fourthPlaceCountryId].score += 6;

    if (!acc[cur.fifthPlaceCountryId]) {
      acc[cur.fifthPlaceCountryId] = {
        name:
          countries.find((x) => x.id === cur.fifthPlaceCountryId)?.name ??
          "N/A",
        score: 0,
      };
    }

    acc[cur.fifthPlaceCountryId].score += 4;

    return acc;
  }, {} as Record<string, { name: string; score: number }>);
};

function getParticipantDisplayName(
  bet: Pick<Bet, "name"> & {
    participant?: { name: string } | null;
  }
) {
  return bet.participant?.name ?? bet.name;
}

function getParticipantKey(
  bet: Pick<Bet, "name"> & {
    participantId?: string | null;
  }
) {
  return bet.participantId ?? bet.name;
}
