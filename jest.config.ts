import type { JestConfigWithTsJest } from 'ts-jest';


const config: JestConfigWithTsJest = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@mistralai/mistralai$': '<rootDir>/src/index.ts',
    },
    modulePathIgnorePatterns: [
      '<rootDir>/dist/',
      '<rootDIr>/examples/'
    ],
  };
  
  export default config;
  