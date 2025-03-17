import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: ["**/*.spec.ts"]
};

export default config;
