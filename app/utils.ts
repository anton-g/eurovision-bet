import type { Bet, Result } from "@prisma/client";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";
import type { BettingPoolFull } from "./models/betting-pool.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function calculatePoints<T extends BettingPoolFull>(
  bets: T["bets"],
  result: Result | null
): (T["bets"][0] & { points: number })[] {
  if (!result) return bets.map((x) => ({ ...x, points: 0 }));

  return bets.map((x) => ({ ...x, points: calculatePoint(x, result) }));
}

function calculatePoint(bet: Bet, result: Result): number {
  let points = 0;
  // 1an på rätt plats, 4p
  if (bet.firstPlaceCountryId === result.firstPlaceCountryId) {
    points += 4;
  } else if (
    // 1an på fel plats, 1p
    bet.firstPlaceCountryId === result.secondPlaceCountryId ||
    bet.firstPlaceCountryId === result.thirdPlaceCountryId ||
    bet.firstPlaceCountryId === result.fourthPlaceCountryId ||
    bet.firstPlaceCountryId === result.fifthPlaceCountryId
  ) {
    points += 1;
  }

  // 2an på rätt plats, 2p
  if (bet.secondPlaceCountryId === result.secondPlaceCountryId) {
    points += 2;
  } else if (
    // 2an på fel plats, 1p
    bet.secondPlaceCountryId === result.firstPlaceCountryId ||
    bet.secondPlaceCountryId === result.thirdPlaceCountryId ||
    bet.secondPlaceCountryId === result.fourthPlaceCountryId ||
    bet.secondPlaceCountryId === result.fifthPlaceCountryId
  ) {
    points += 1;
  }

  // 3an på rätt plats, 2p
  if (bet.thirdPlaceCountryId === result.thirdPlaceCountryId) {
    points += 2;
  } else if (
    // 3an på fel plats, 1p
    bet.thirdPlaceCountryId === result.firstPlaceCountryId ||
    bet.thirdPlaceCountryId === result.secondPlaceCountryId ||
    bet.thirdPlaceCountryId === result.fourthPlaceCountryId ||
    bet.thirdPlaceCountryId === result.fifthPlaceCountryId
  ) {
    points += 1;
  }

  // 4an på rätt plats, 2p
  if (bet.fourthPlaceCountryId === result.fourthPlaceCountryId) {
    points += 2;
  } else if (
    // 4an på fel plats, 1p
    bet.fourthPlaceCountryId === result.firstPlaceCountryId ||
    bet.fourthPlaceCountryId === result.secondPlaceCountryId ||
    bet.fourthPlaceCountryId === result.thirdPlaceCountryId ||
    bet.fourthPlaceCountryId === result.fifthPlaceCountryId
  ) {
    points += 1;
  }

  // 5an på rätt plats, 2p
  if (bet.fifthPlaceCountryId === result.fifthPlaceCountryId) {
    points += 2;
  } else if (
    // 5an på fel plats, 1p
    bet.fifthPlaceCountryId === result.firstPlaceCountryId ||
    bet.fifthPlaceCountryId === result.secondPlaceCountryId ||
    bet.fifthPlaceCountryId === result.thirdPlaceCountryId ||
    bet.fifthPlaceCountryId === result.fourthPlaceCountryId
  ) {
    points += 1;
  }

  // Sveriges placering korrekt, 3p
  if (bet.swedenPosition === result.swedenPosition) {
    points += 3;
  }

  return points;
}
