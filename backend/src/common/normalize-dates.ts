type DateFieldValue = string | Date | null | undefined;

export function normalizeDates<T extends object, K extends keyof T>(
  input: T,
  keys: readonly K[],
): T {
  const output = { ...input };
  for (const key of keys) {
    const value = output[key] as DateFieldValue;
    if (typeof value === 'string') {
      output[key] = new Date(value) as T[K];
    }
  }
  return output;
}
