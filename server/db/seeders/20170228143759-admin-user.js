'use strict';
require('dotenv').config();
const faker = require('faker');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      id: 1,
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      RoleId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: process.env.USER_EMAIL,
      password:process.env.USER_PASSWORD,
      RoleId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', {
      id: [1, 2]
    });
  }
};
