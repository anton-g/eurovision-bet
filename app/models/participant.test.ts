import { normalizeParticipantName } from "./participant";

test("normalizeParticipantName trims and collapses whitespace", () => {
  expect(normalizeParticipantName("  Anton   Svensson  ")).toBe(
    "anton svensson"
  );
});

test("normalizeParticipantName preserves internal punctuation while lowercasing", () => {
  expect(normalizeParticipantName("Åsa-Lena  O'Brien")).toBe(
    "åsa-lena o'brien"
  );
});
