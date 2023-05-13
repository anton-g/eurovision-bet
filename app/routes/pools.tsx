import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { getUserBettingPools } from "~/models/betting-pool.server";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const pools = await getUserBettingPools(userId);

  return json({ pools });
};

export default function PoolsPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  console.log(user);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-violet-100 p-4 text-white">
        <h1 className="text-3xl font-black text-violet-600">
          <Link to=".">BETS</Link>
        </h1>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded-md border-2 border-violet-500 px-4 py-1 text-base font-medium text-violet-500 shadow-sm hover:border-violet-600 hover:bg-violet-100 hover:text-violet-700"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="flex h-full w-80 flex-col border-r bg-gray-50">
          <Link to="new" className="text-l block p-2 px-4 text-blue-500">
            + Create betting pool
          </Link>

          <hr />

          {data.pools.length === 0 ? (
            <p className="p-4">No pools yet</p>
          ) : (
            <ol>
              {data.pools.map((pool) => (
                <li key={pool.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={pool.id}
                  >
                    {getRandomPoolEmoji(pool.name)} {pool.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}

          <hr />

          {user.admin && (
            <Link
              to="result"
              className="text-l mt-auto block p-2 px-4 text-blue-500"
            >
              Update result
            </Link>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function hashStr(str: string) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    hash += charCode;
  }
  return hash;
}

export const getRandomPoolEmoji = (input: string) => {
  // Emojis related to Eurovision Song Contest
  const emoji = ["👩‍🎤", "👨‍🎤", "🧑‍🎤", "🏳️‍🌈", "🌈", "🦄", "🦋", "🐝", "🐞"];

  const hash = hashStr(input);
  const index = (hash % Object.keys(emoji).length) + 1;

  return emoji[index];
};
