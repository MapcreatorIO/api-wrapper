const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const webpackMerge = require('webpack-merge');

const defaultConfig = {
  target: 'node',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/node'),

    library: 'maps4news',
    libraryTarget: 'amd',
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
    new webpack.BannerPlugin(fs.readFileSync('LICENSE', 'ascii')),
  ],
};

module.exports = [
  defaultConfig,
  webpackMerge(defaultConfig, {
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'dist/web'),
      libraryTarget: 'window',
    },
  }),
];
