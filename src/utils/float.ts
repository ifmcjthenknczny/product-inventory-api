export const toCents = (value: number): number => Math.round(value * 100);

export const fromCents = (value: number): number => value / 100;

export const addCents = (a: number, b: number): number => fromCents(toCents(a) + toCents(b));

export const subtractCents = (a: number, b: number): number => fromCents(toCents(a) - toCents(b));

export const multiplyCents = (a: number, b: number): number => fromCents(toCents(a) * toCents(b));

export const divideCents = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return fromCents(toCents(a) / toCents(b));
}