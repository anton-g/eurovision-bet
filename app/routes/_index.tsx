import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Eurovision Bets" }];

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative flex flex-col sm:pb-16 sm:pt-8">
        <div className="relative">
          <img
            className=" max-h-64 object-contain"
            src="/eurovision_logo_dont_sue_me.png"
            alt="Eurovision Song Contest Logo"
          />
          <p className="absolute -right-4 bottom-2 -rotate-12 text-5xl font-black text-violet-600">
            BETS!
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-lg text-center text-xl sm:max-w-3xl">
          Because why not over-engineer something that could've been an excel
          file?
        </p>
        <div className="mx-auto mt-20">
          {user ? (
            <Link
              to="/pools"
              className="flex items-center justify-center rounded-md border-2 border-violet-500 px-4 py-3 text-base font-medium text-violet-500 shadow-sm hover:border-violet-600 hover:bg-violet-100 hover:text-violet-700 sm:px-8"
            >
              View your pools
            </Link>
          ) : (
            <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
              <Link
                to="/join"
                className="flex items-center justify-center rounded-md border-2 border-violet-500 px-4 py-3 text-base font-medium text-violet-500 shadow-sm hover:border-violet-600 hover:bg-violet-100 hover:text-violet-700 sm:px-8"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center rounded-md bg-violet-500 px-4 py-3 font-medium text-white hover:bg-violet-600"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
