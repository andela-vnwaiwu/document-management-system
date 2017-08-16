/* eslint no-console: 0 */

import dotenv from 'dotenv';
import debug from 'debug';
import http from 'http';
import Logger from 'js-logger';

import app from './config/express';
import db from './models/';

dotenv.config();
debug('dms:server');
Logger.useDefaults();

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

const port = normalizePort(process.env.PORT || 8080);
app.set('port', port);

const server = http.createServer(app);

// /**
//  * Event listener for HTTP server "listening" event.
//  */
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    `pipe ${addr}` :
    `port ${addr.port}`;
  debug(`🚧 Application is Listening on ${bind}`);
};

db.sequelize.sync()
  .then(() => server.listen(port))
  .then(() => Logger
    .warn(`🚧 Application is Listening on ${port}`))
  .catch(error => Logger.error(error));

export default app;
