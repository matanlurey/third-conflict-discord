export function deepClone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input));
}

export function fixedFloat(input: number): number {
  return parseFloat(input.toFixed(2));
}
