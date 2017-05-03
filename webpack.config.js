var webpack = require('webpack');
var path = require('path');
var fs = require('fs');


module.exports = {
  entry: './src/test.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
