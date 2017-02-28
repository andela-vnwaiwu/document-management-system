/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
import bodyParser from 'body-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';

import routes from './routes';
import authenticate from '../middlewares/authenticate';


const app = express();
const router = express.Router();

routes(router, authenticate);

app.set('views', path.join(__dirname, '../client/views/'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  return res.status(200)
    .json({ message: 'Welcome to Vonvick\'s Document Management System' });
});
app.use('/api', router);

export default app;
