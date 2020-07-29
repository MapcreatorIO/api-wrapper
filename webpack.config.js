const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').execSync;
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const merge = require('webpack-merge');

const version = exec('git describe --exact-match --tag HEAD 2>/dev/null || git rev-parse --short HEAD').toString().trim();
const license = fs.readFileSync('LICENSE', 'ascii');

if (!fs.existsSync('.env')) {
  fs.copySync('.env.example', '.env');
  console.log('Copied .env.example => .env');
}

const licenseBanner = new webpack.BannerPlugin(license + '\nhash:[hash], chunkhash:[chunkhash], name:[name], version:' + version);

const common = {
  mode: 'none',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),

    library: 'maps4news',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /(src)/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  optimization: {
    concatenateModules: true,
    minimize: true,
    minimizer: [new TerserPlugin()],
    occurrenceOrder: true,
  },
  node: false,
  devtool: 'source-map',
  plugins: [
    new Dotenv({
      safe: true,
      systemvars: true,
    }),

    new webpack.DefinePlugin({
      VERSION: JSON.stringify(version),
    }),
  ],
};

module.exports = [
  // Browser
  merge(common, {
    target: 'web',
    output: {
      libraryTarget: 'umd',
    },
    externals: [],
    entry: {
      'bundle.browser': './src/index.js',
      'bundle.browser.min': './src/index.js',
    },
    plugins: [
      new webpack.BannerPlugin('This bundle contains the following packages:\n' + exec('$(npm bin)/licensecheck')),

      licenseBanner,
    ],
  }),

  // Node
  merge(common, {
    target: 'node',
    output: {
      libraryTarget: 'commonjs2',
    },
    externals: [nodeExternals()],
    entry: {
      'bundle': './src/index.js',
      'bundle.min': './src/index.js',
    },
    plugins: [
      licenseBanner,
    ],
  }),
];
