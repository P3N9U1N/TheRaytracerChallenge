//https://itnext.io/testing-with-jest-in-typescript-cc1cd0095421

module.exports = {
  haste: {
    enableSymlinks: true, //Is needed, or debugging doesnt work properly for symlinked files
  },
  watchman: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  "moduleNameMapper": {
    "^raytracer/(.*)$": "<rootDir>/../raytracer/src/$1",    
  },
  roots: [
    "./src"   
   ]
};
