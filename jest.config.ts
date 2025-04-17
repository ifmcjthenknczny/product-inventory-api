import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: ["**/*.spec.ts"],
    testTimeout: 10000,
};

export default config;
