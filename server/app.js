/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": false }] */
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import debug from 'debug';
import express from 'express';
import http from 'http';
import logger from 'morgan';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import DashboardPlugin from 'webpack-dashboard/plugin';
import config from '../webpack.config';

import routes from './config/routes';

dotenv.config();
debug('dms:server');

const compiler = webpack(config);
// Apply CLI dashboard for your webpack dev server
compiler.apply(new DashboardPlugin());

const app = express();
const router = express.Router();

routes(router);

app.set('views', path.join(__dirname, 'client/views'));
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

app.use('/', router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Normalize a port into a number, string, or false.
 * @param {number} val port number to be used
 * @returns {any} res
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
  return false;
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`🚧 Application is Listening on ${bind}`);
};

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export default app;
