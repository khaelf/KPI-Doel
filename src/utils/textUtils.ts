/**
 * Capitalizes the start of the string and any letter following a period,
 * exclamation mark, or question mark (plus whitespace).
 */
export function autoCapitalizeText(val: string): string {
  if (!val) return val;
  return val.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
}
