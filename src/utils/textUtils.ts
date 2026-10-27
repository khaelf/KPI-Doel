/**
 * Capitalizes the first letter of a text string (or sentence).
 */
export function autoCapitalizeText(val: string): string {
  if (!val) return val;
  // Ensure the very first non-whitespace letter is capitalized
  return val.replace(/(^\s*)([a-z])/, (_, space, char) => space + char.toUpperCase());
}
