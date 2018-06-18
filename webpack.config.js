const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const exec = require('child_process').execSync;
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const version = exec('git describe --exact-match --tag HEAD 2>/dev/null || git rev-parse --short HEAD').toString().trim();
const license = fs.readFileSync('LICENSE', 'ascii');

if (!fs.existsSync('.env')) {
  fs.copySync('.env.example', '.env');
  console.log('Copied .env.example => .env');
}


const config = {
  mode: 'none',
  target: 'web', // output is fine for nodejs usage
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
        include: /(src)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['env', {
              targets: {
                'node': '8.11',
              },
            }]],
            cacheDirectory: true,
            plugins: [
              'transform-export-extensions',
            ],
            sourceMap: true,
            env: {
              production: {
                presets: [
                  '@ava/stage-4',
                ],
              },
            },
          },
        },
      },
    ],
  },
  optimization: {
    minimize: true,

    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
        sourceMap: false, // Useless because it's based on the bundle
        parallel: true,
      }),
    ],
  },
  node: false,
  externals: [nodeExternals()],
  devtool: 'source-map',
  plugins: [
    new Dotenv({
      safe: true,
      systemvars: true,
    }),

    new webpack.DefinePlugin({
      VERSION: JSON.stringify(version),
      LICENSE: JSON.stringify(license),
    }),

    new webpack.BannerPlugin(license + '\nhash:[hash], chunkhash:[chunkhash], name:[name], version:' + version),
  ],
};

const browserConfig = Object.assign({}, config, {
  entry: {
    'bundle.browser': ['babel-polyfill', './src/index.js'],
    'bundle.browser.min': ['babel-polyfill', './src/index.js'],
  },
  externals: [],
  plugins: [
    new webpack.BannerPlugin('This bundle contains the following packages:\n' + exec('$(npm bin)/licensecheck')),
    ...config.plugins,
  ],
});

browserConfig.module.rules[0].use.options.presets[0][1] = {
  targets: {
    browsers: require('./package.json').browserslist,
  },
};

module.exports = [config, browserConfig];
