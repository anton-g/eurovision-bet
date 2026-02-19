import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllPools } from "~/models/betting-pool.server";

import { calculatePoints } from "~/utils";
import { ResponsiveBump } from "@nivo/bump";
import { getResult } from "~/models/result.server";

export const loader = async ({ request }: LoaderArgs) => {
  const pools = await getAllPools();

  const results = await Promise.all(
    pools.flatMap(async (pool) => {
      const result = await getResult(pool.year || 2024);
      const bets = calculatePoints(pool.bets, result).sort(
        (a, b) => b.points - a.points
      );
      return bets.flatMap((bet, index) => ({
        name: bet.name,
        poolId: bet.poolId,
        year: pool.year,
        points: bet.points,
        position: index + 1,
      }));
    })
  );

  const flattened = results.flatMap((x) => x);
  const grouped = groupBy(flattened, "name");

  // Calculate who has been best at guessing Swedens position
  // const allResults = await prisma.result.findMany({
  //   select: {
  //     year: true,
  //     swedenPosition: true,
  //   },
  // });
  // const bets = await prisma.bet.findMany({
  //   select: {
  //     name: true,
  //     swedenPosition: true,
  //     pool: {
  //       select: {
  //         year: true,
  //       },
  //     },
  //   },
  // });
  // const betsByName = groupBy(bets, "name");
  // // Calculate the average delta between each names sweden bet and the actual sweden position for each year
  // const swedenBetDeltas = Object.entries(betsByName).map(([name, bets]) => {
  //   if (bets.length < 2) {
  //     return {
  //       name,
  //       averageDelta: null,
  //     };
  //   }

  //   const swedenResults = allResults.map((result) => {
  //     const bet = bets.find((bet) => bet.pool.year === result.year);
  //     return {
  //       year: result.year,
  //       delta: bet
  //         ? Math.abs(result.swedenPosition - bet.swedenPosition)
  //         : null,
  //     };
  //   });
  //   const averageDelta =
  //     swedenResults.reduce(
  //       (acc, curr) => (curr.delta ? acc + curr.delta : acc),
  //       0
  //     ) / swedenResults.length;
  //   return {
  //     name,
  //     averageDelta,
  //   };
  // });

  // console.log(swedenBetDeltas);

  return json({ bets: grouped });
};

export default function PoolsPage() {
  const data = useLoaderData<typeof loader>();

  const years = [2021, 2022, 2023, 2024, 2025];

  const placementResults = Object.entries(data.bets)
    .filter(([_, bets]) => bets.some((x) => x.year === years.at(-1)))
    .map(([name, bets]) => ({
      id: name,
      data: years.map((year) => {
        const bet = bets.find((bet) => bet.year === year);
        return {
          x: year,
          y: bet ? bet.position : null,
        };
      }),
    }));

  return (
    <div className="flex h-full flex-col p-5">
      <h2 className="text-2xl font-bold">Historiska placeringar</h2>
      <ResponsiveBump
        data={placementResults}
        colors={{ scheme: "dark2" }}
        lineWidth={3}
        activeLineWidth={6}
        inactiveLineWidth={3}
        inactiveOpacity={0.15}
        pointSize={10}
        activePointSize={16}
        inactivePointSize={0}
        // pointColor={{ theme: "" }}
        pointBorderWidth={3}
        activePointBorderWidth={3}
        pointBorderColor={{ from: "serie.color" }}
        axisLeft={{ legend: "Placering", legendOffset: -40 }}
        margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
      />
    </div>
  );
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
