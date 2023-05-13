import type { Bet, Country, Result } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { ReactNode } from "react";
import invariant from "tiny-invariant";
import { getPool as getBettingPool } from "~/models/betting-pool.server";
import { getCountries } from "~/models/country.server";
import { getResult } from "~/models/result.server";
import { calculatePoints } from "~/utils";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.poolId, "poolId not found");

  const pool = await getBettingPool(params.poolId);
  if (!pool) {
    throw new Response("Not Found", { status: 404 });
  }

  const result = await getResult(2023);

  const bets = calculatePoints(pool.bets, result).sort(
    (a, b) => b.points - a.points
  );

  const simulatedResult = simulateResult(pool.bets, await getCountries());

  return json({ pool, bets, result, simulatedResult });
};

export default function PoolDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const showResult = Boolean(data.result);

  return (
    <div className="mx-auto max-w-fit p-3 pb-16">
      <div className="mx-auto mt-10 flex h-full w-full max-w-lg flex-col items-center">
        <div className="relative flex flex-col pb-16">
          <div className="relative">
            <img
              className=" max-h-64 object-contain"
              src="/eurovision_logo_dont_sue_me.png"
              alt="Eurovision Song Contest Logo"
            />
            <p className="absolute bottom-0 right-0 -rotate-12 text-2xl font-black text-violet-600">
              BETS!
            </p>
          </div>
        </div>
      </div>
      <h4 className="mb-8 text-center text-3xl font-bold">{data.pool.name}</h4>
      <div className="relative max-w-fit overflow-x-auto">
        <table className="text-center text-sm font-light">
          <thead className="border-b font-medium dark:border-neutral-500">
            <tr>
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
            {data.bets.map((bet, index) => (
              <tr key={bet.id} className="border-b dark:border-neutral-500">
                <NameCell showResult={showResult} position={index + 1}>
                  {bet.name}
                </NameCell>
                <td className="whitespace-nowrap px-6 py-2">{bet.points}</td>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "firstPlaceCountryId"
                  )}
                >
                  {bet.firstPlace.name}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "secondPlaceCountryId"
                  )}
                >
                  {bet.secondPlace.name}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "thirdPlaceCountryId"
                  )}
                >
                  {bet.thirdPlace.name}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "fourthPlaceCountryId"
                  )}
                >
                  {bet.fourthPlace.name}
                </Cell>
                <Cell
                  showResult={showResult}
                  correct={getBetResult(
                    bet,
                    data.result,
                    "fifthPlaceCountryId"
                  )}
                >
                  {bet.fifthPlace.name}
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
            Om våra gissningar istället hade gett poängen 12-10-8-6-4 så hade
            detta blivit resultatet:
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
                {Object.values(data.simulatedResult)
                  .sort((a, b) => b.score - a.score)
                  .map((country, index) => (
                    <tr
                      key={country.name}
                      className="border-b dark:border-neutral-500"
                    >
                      <NameCell showResult={showResult} position={index + 1}>
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

  console.log(result, bet[column]);
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
