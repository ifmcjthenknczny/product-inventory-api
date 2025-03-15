import { fromCents } from "./price";
export const geometricSumFromPercentCoefficients = (coefficients: number[]): number => {
    const multiplier = coefficients.reduce((acc, coeff) => acc * (1 + fromCents(coeff)), 1);
    return multiplier;
};
