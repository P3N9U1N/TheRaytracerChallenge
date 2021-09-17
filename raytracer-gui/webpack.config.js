const path = require('path');
//const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry:
  { 
    // chapter6: {import :'./src/chapter6.ts'},
    //chapter7: {import :'./src/chapter7.ts'},  
    //chapter8: {import :'./src/chapter8.ts'},
    //chapter9: {import :'./src/chapter9.ts'},     
    //chapter10: {import :'./src/chapter10.ts'}, chapter10renderWorker: {import :'./src/render-worker.ts'},   
    chapter11: {import :'./src/chapter11.ts'}, chapter11renderWorker: {import :'./src/render-worker.ts'},   
  },
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
    extensions: ['.tsx', '.ts', '.js'],
   /*
    alias: {
      raytracer: path.resolve(__dirname, '../raytracer/src/')   
    },*/
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, ''),
  }, 
  /* //Bundle common dependencies into seperate file (todo)(https://webpack.js.org/guides/code-splitting/)
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },*/
};