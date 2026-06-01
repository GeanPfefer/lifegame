import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@anima/types$': '<rootDir>/../types/src/index.ts',
  },
};

export default config;
