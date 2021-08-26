const path = require('path');

module.exports = {
  entry: '../node_modules/raytracer-gui/dist/index.js',
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, ''),
  },
};