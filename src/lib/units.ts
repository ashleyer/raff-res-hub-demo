/* Residence number helpers, shared by the portal store and the BuildingLink
   adapter so both sides agree on what "the same unit" means. */

const PREFIX = /^(residence|unit|apt\.?|apartment)\s+/i;

/** "22h" / "unit 22H" -> "Residence 22H" */
export function formatUnit(raw: string): string {
  const value = raw.trim().replace(PREFIX, "");
  if (!value) return "";
  return `Residence ${value.toUpperCase()}`;
}

/** Comparison key: strips the prefix and whitespace, upper-cases the rest. */
export function unitKey(raw: string): string {
  return raw.replace(PREFIX, "").replace(/\s+/g, "").toUpperCase();
}

export function sameUnit(a: string, b: string): boolean {
  return unitKey(a) === unitKey(b);
}
