import dotenv from 'dotenv';
import webpack from 'webpack';

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  entry: ['webpack-hot-middleware/client', './client/App.js'],
  output: {
    path: `${__dirname}/client/assets/javascripts`,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js'],
    alias: {
      request: 'browser-request'
    }
  },
  module: {
    loaders: [
      // Javascript
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: `${__dirname}/client`,
        exclude: /node_modules/,
        query: {
          "env": {
            "development": {
              "presets": ["react-hmre"],
              "plugins": [
                ["react-transform", {
                  "transforms": [{
                    "transform": "react-transform-hmr",
                    "imports": ["react"],
                    "locals": ["module"]
                  }]
                }]
              ]
            }
          },
        }
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  }

}
