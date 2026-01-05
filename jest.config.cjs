/** @type {import('jest').Config} */
module.exports = {

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
      useESM: true,
    },
  },

  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testMatch: [
    // "**/?(*.)+(test|spec).ts"
    "<rootDir>/test/**/*.test.ts",
    "<rootDir>/test/**/*.spec.ts"
  ],
};
