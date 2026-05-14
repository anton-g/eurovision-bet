import { getCompetitionRanks, validateEmail } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});

test("getCompetitionRanks keeps tied scores on the same placement", () => {
  expect(
    getCompetitionRanks([
      { points: 12 },
      { points: 12 },
      { points: 9 },
      { points: 9 },
      { points: 8 },
    ])
  ).toEqual([1, 1, 3, 3, 5]);
});
