const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

module.exports = {
  target: 'node', // output is fine for web usage
  entry: {
    'bundle': './src/index.js',
    'bundle.min': './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),

    library: 'maps4news',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
    }),
    new webpack.BannerPlugin(fs.readFileSync('LICENSE', 'ascii')),
  ],
};
