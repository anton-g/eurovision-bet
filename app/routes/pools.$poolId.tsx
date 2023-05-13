import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import {
  addBet,
  deleteBet,
  deleteBettingPool,
  getPool as getBettingPool,
} from "~/models/betting-pool.server";
import { getCountries } from "~/models/country.server";

import { requireUserId } from "~/session.server";
import { CountrySelect } from "../components/CountrySelect";
import { getResult } from "~/models/result.server";
import { calculatePoints } from "~/utils";
import { ConfirmDeleteButton } from "../components/ConfirmDeleteButton";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  invariant(params.poolId, "poolId not found");

  const pool = await getBettingPool(params.poolId);
  if (!pool) {
    throw new Response("Not Found", { status: 404 });
  }

  const result = await getResult(2023);

  const bets = calculatePoints(pool.bets, result).sort(
    (a, b) => b.points - a.points
  );

  const countries = await getCountries();

  return json({ pool, bets, countries });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.poolId, "poolId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  if (typeof action !== "string" || action.length === 0) {
    return json(
      { errors: { body: null, title: "Action is required" } },
      { status: 400 }
    );
  }

  if (action === "delete") {
    await deleteBettingPool(params.poolId, userId);
    return redirect("/pools");
  }

  if (action === "deleteBet") {
    const betId = formData.get("betId");
    if (typeof betId !== "string" || betId.length === 0) {
      return json(
        { errors: { body: null, title: "Bet ID is required" } },
        { status: 400 }
      );
    }

    await deleteBet(betId);
    return json({ success: true });
  }

  const name = formData.get("name");
  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { body: null, title: "Name is required" } },
      { status: 400 }
    );
  }

  const position1Raw = formData.get("position1");
  const position1 =
    typeof position1Raw === "string" ? parseInt(position1Raw) : null;
  if (typeof position1 !== "number" || isNaN(position1)) {
    return json(
      { errors: { body: null, title: "Position 1 is required" } },
      { status: 400 }
    );
  }

  const position2Raw = formData.get("position2");
  const position2 =
    typeof position2Raw === "string" ? parseInt(position2Raw) : null;
  if (typeof position2 !== "number" || isNaN(position2)) {
    return json(
      { errors: { body: null, title: "Position 2 is required" } },
      { status: 400 }
    );
  }

  const position3Raw = formData.get("position3");
  const position3 =
    typeof position3Raw === "string" ? parseInt(position3Raw) : null;
  if (typeof position3 !== "number" || isNaN(position3)) {
    return json(
      { errors: { body: null, title: "Position 3 is required" } },
      { status: 400 }
    );
  }

  const position4Raw = formData.get("position4");
  const position4 =
    typeof position4Raw === "string" ? parseInt(position4Raw) : null;
  if (typeof position4 !== "number" || isNaN(position4)) {
    return json(
      { errors: { body: null, title: "Position 4 is required" } },
      { status: 400 }
    );
  }

  const position5Raw = formData.get("position5");
  const position5 =
    typeof position5Raw === "string" ? parseInt(position5Raw) : null;
  if (typeof position5 !== "number" || isNaN(position5)) {
    return json(
      { errors: { body: null, title: "Position 5 is required" } },
      { status: 400 }
    );
  }

  const swedenPositionRaw = formData.get("swedenPosition");
  const swedenPosition =
    typeof swedenPositionRaw === "string" ? parseInt(swedenPositionRaw) : null;

  if (!swedenPosition || isNaN(swedenPosition)) {
    return json(
      { errors: { body: null, title: "Sweden position is required" } },
      { status: 400 }
    );
  }

  await addBet({
    poolId: params.poolId,
    name,
    firstPlaceCountryId: position1,
    secondPlaceCountryId: position2,
    thirdPlaceCountryId: position3,
    fourthPlaceCountryId: position4,
    fifthPlaceCountryId: position5,
    swedenPosition,
  });

  return json({});
};

export default function PoolDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-2xl font-bold">{data.pool.name}</h3>
      <hr className="my-4" />
      <Form method="post" className="flex flex-row gap-2 ">
        <input type="hidden" name="action" value="add" />
        <label className="flex w-40 flex-col gap-1">
          <span>Name: </span>
          <input
            name="name"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>1</span>
          <CountrySelect countries={data.countries} name="position1" />
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>2</span>
          <CountrySelect countries={data.countries} name="position2" />
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>3</span>
          <CountrySelect countries={data.countries} name="position3" />
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>4</span>
          <CountrySelect countries={data.countries} name="position4" />
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>5</span>
          <CountrySelect countries={data.countries} name="position5" />
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>🇸🇪</span>
          <input
            type="number"
            name="swedenPosition"
            className="w-20 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          ></input>
        </label>
        <button
          type="submit"
          className="self-end rounded-md bg-blue-500 px-5 py-2 text-white"
        >
          Add
        </button>
      </Form>
      <hr className="my-4" />
      <h4 className="text-xl font-bold">Bets</h4>
      <table className="min-w-full text-center text-sm font-light">
        <thead className="border-b font-medium dark:border-neutral-500">
          <tr>
            <th scope="col" className="px-6 py-2">
              Name
            </th>
            <th scope="col" className="px-6 py-2">
              1
            </th>
            <th scope="col" className="px-6 py-2">
              2
            </th>
            <th scope="col" className="px-6 py-2">
              3
            </th>
            <th scope="col" className="px-6 py-2">
              4
            </th>
            <th scope="col" className="px-6 py-2">
              5
            </th>
            <th scope="col" className="px-6 py-2">
              🇸🇪
            </th>
            <th scope="col" className="px-6 py-2">
              Points
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.bets.map((bet) => (
            <tr key={bet.id} className="border-b dark:border-neutral-500">
              <td className="whitespace-nowrap px-6 py-2 font-medium">
                {bet.name}
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                {bet.firstPlace.name}
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                {bet.secondPlace.name}
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                {bet.thirdPlace.name}
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                {bet.fourthPlace.name}
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                {bet.fifthPlace.name}
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                {bet.swedenPosition}
              </td>
              <td className="whitespace-nowrap px-6 py-2">{bet.points}</td>
              <td>
                <Form method="post">
                  <input type="hidden" name="action" value="deleteBet" />
                  <input type="hidden" name="betId" value={bet.id} />
                  <ConfirmDeleteButton />
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Form method="post" className="mt-auto">
        <input type="hidden" name="action" value="delete" />
        <ConfirmDeleteButton />
      </Form>
    </div>
  );
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
    return <div>Pool not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
