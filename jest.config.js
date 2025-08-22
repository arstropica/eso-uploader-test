module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  maxConcurrency: 5,
  maxWorkers: 5,
  roots: ["tests"],
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/shared/$1"
  },
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  testRegex: ".*\\.spec\\.ts$",
  testPathIgnorePatterns: ["/node_modules/", "/tests/readiness.playwright.spec.js"],
  testTimeout: 60 * 1000,
};
