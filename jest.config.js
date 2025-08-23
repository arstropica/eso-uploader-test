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
  testPathIgnorePatterns: ["/node_modules/"],
  testTimeout: 60 * 1000,
  maxWorkers: 1,
  // keep default reporter + our throttling reporter
  reporters: [
    "default",
    ["<rootDir>/shared/throttledReporter.js", { delayMs: 30000 }] // tweak as needed
  ],

};
