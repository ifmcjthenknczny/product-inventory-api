import { fromCents } from "./price";

export const geometricSumFromPercentCoefficients = (coefficients: number[]): number => {
    const multiplier = coefficients.reduce((acc, coeff) => acc * (1 + fromCents(coeff)), 1);
    return multiplier;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>;
};
