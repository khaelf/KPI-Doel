/**
 * Converts text to Title Case (capitalizes the first letter of each word).
 */
export function autoCapitalizeText(val: string): string {
  if (!val) return val;
  return val.replace(/\b([a-zA-Zà-öø-ÿ])/g, (match) => match.toUpperCase());
}
