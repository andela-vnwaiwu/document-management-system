/* eslint no-console: 0 */

import dotenv from 'dotenv';
import debug from 'debug';
import http from 'http';

import app from './config/express';
import db from './models/';

dotenv.config();
debug('dms:server');

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
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`🚧 Application is Listening on ${bind}`);
};

db.sequelize
  .authenticate()
  .then(() => {
    server.listen(port);
    server.on('listening', onListening);
    console.log('Database connection to ', process.env.NODE_ENV, ' successful');
  })
  .catch((error) => {
    console.log('Error creating connection:', error);
  });

export default app;
