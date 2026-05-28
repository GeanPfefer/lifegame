import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@lifegame/types$': '<rootDir>/../types/src/index.ts',
  },
};

export default config;
