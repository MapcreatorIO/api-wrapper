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

    '<rootDir>/src/utils/base64.js',
    '<rootDir>/src/utils/Unobservable.js',
  ],
  coverageDirectory: 'build/coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'build' }],
  ],
  setupFiles: [
    '<rootDir>/tests/setup.js',
  ],
};
