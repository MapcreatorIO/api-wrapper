const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const webpackMerge = require('webpack-merge');

const defaultConfig = {
  target: 'node',
  entry: {
    'bundle.node': './src/index.js',
    'bundle.node.min': './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),

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
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
    }),
    new webpack.BannerPlugin(fs.readFileSync('LICENSE', 'ascii')),
  ],
};

module.exports = [
  defaultConfig,
  webpackMerge(defaultConfig, {
    target: 'web',
    entry: {
      'bundle.web': './src/index.js',
      'bundle.web.min': './src/index.js',
    },
    output: {
      libraryTarget: 'window',
    },
  }),
];
