export function normalizeParticipantName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
