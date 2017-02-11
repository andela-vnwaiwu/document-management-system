require('dotenv').config();

module.exports = {
  development: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    dialect: 'postgres'
  },
  production: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    dialect: 'postgres'
  }
};
