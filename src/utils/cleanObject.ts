/**
 * Drops undefined / null / empty-string values so query params stay clean.
 * Useful when endpoints grow many optional filters.
 */
export function cleanObject<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as Partial<T>
}
