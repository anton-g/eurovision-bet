import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { ConfirmDeleteButton } from "~/components/ConfirmDeleteButton";
import { CountrySelect } from "~/components/CountrySelect";
import { getCountries } from "~/models/country.server";
import { deleteResult, getResult, updateResult } from "~/models/result.server";
import { requireUser, requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await requireUser(request);

  if (!user.admin) {
    throw new Response("Access Denied", {
      status: 401,
    });
  }

  const countries = await getCountries();
  const result = await getResult(2023);

  return json({ countries, result });
};

export const action = async ({ request }: ActionArgs) => {
  await requireUserId(request);

  const formData = await request.formData();

  const action = formData.get("action");
  if (action === "delete") {
    await deleteResult(2023);
    return json({ success: true });
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
  console.log(swedenPosition, swedenPositionRaw);
  if (!swedenPosition || isNaN(swedenPosition)) {
    return json(
      { errors: { body: null, title: "Sweden position is required" } },
      { status: 400 }
    );
  }

  await updateResult({
    year: 2023,
    firstPlaceCountryId: position1,
    secondPlaceCountryId: position2,
    thirdPlaceCountryId: position3,
    fourthPlaceCountryId: position4,
    fifthPlaceCountryId: position5,
    swedenPosition,
  });

  return json({});
};

export default function ResultPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col gap-4">
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>First place: </span>
            <CountrySelect
              name="position1"
              countries={data.countries}
              defaultValue={data.result?.firstPlaceCountryId}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Second place: </span>
            <CountrySelect
              name="position2"
              countries={data.countries}
              defaultValue={data.result?.secondPlaceCountryId}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Third place: </span>
            <CountrySelect
              name="position3"
              countries={data.countries}
              defaultValue={data.result?.thirdPlaceCountryId}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Fourth place: </span>
            <CountrySelect
              name="position4"
              countries={data.countries}
              defaultValue={data.result?.fourthPlaceCountryId}
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Fifth place: </span>
            <CountrySelect
              name="position5"
              countries={data.countries}
              defaultValue={data.result?.fifthPlaceCountryId}
            />
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Sweden:</span>
            <input
              type="number"
              name="swedenPosition"
              defaultValue={data.result?.swedenPosition}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />
          </label>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
      <Form method="post" className="ml-auto mt-auto">
        <input type="hidden" name="action" value="delete" />
        <ConfirmDeleteButton />
      </Form>
    </div>
  );
}
