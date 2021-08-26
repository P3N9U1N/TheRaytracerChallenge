const path = require('path');
//const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  "context": __dirname,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          "loader": "ts-loader",
          "options": {
            "projectReferences": true,
            "transpileOnly": false
          }
        },
        exclude: /node_modules/,
      },
    ],
  }, 
  resolve: {
    extensions: ['.tsx', '.ts', 'js'],
    alias: {
      raytracer: path.resolve(__dirname, '../raytracer/src/')   
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};