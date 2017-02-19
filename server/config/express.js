/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": false }] */
/* eslint import/no-unresolved: 0 */
import bodyParser from 'body-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import DashboardPlugin from 'webpack-dashboard/plugin';
import config from '../../webpack.config';

import routes from './routes';
import authenticate from '../middlewares/authenticate';


const app = express();
const router = express.Router();

routes(router, authenticate);

const compiler = webpack(config);
// Apply CLI dashboard for your webpack dev server
compiler.apply(new DashboardPlugin());

app.set('views', path.join(__dirname, '../client/views/'));
app.set('view engine', 'pug');

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  },
  historyApiFallback: true
}));
app.use(webpackHotMiddleware(compiler));

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router);

export default app;
