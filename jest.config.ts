import { Config } from "@jest/types";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.test" });

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/tests/testSetup.ts",
  globalTeardown: "<rootDir>/tests/teardown.ts",
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/tests/auth/**/*.test.ts",
    "<rootDir>/tests/api/**/*.test.ts",
  ],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;
