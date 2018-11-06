module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!node_modules/**',
  ],
  coverageReporters: [
    'html', 'cobertura',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/errors/',
  ],
  coverageDirectory: 'build/coverage',
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: 'build'}],
  ],
};
