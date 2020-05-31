module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: `test\/.*_test.ts$`,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
