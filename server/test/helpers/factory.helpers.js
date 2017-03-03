/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
import faker from 'faker';

module.exports = {
  users: {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },

  secondAdmin: {
    username: 'secondOga',
    firstName: 'Yokohama',
    lastName: 'Suzuki',
    email: 'secondOga@test.com',
    password: 'nakata'
  },

  adminRole: {
    title: 'admin'
  },

  regularRole: {
    title: 'regular'
  },

  role: {
    title: 'role'
  },

  secondUser: {
    username: 'faker',
    lastName: 'factory',
    firstName: 'factories',
    email: 'factory@email.com',
    password: 'password'
  },

  thirdUser: {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },

  wrongUser: {
    username: 'faker',
    lastName: undefined,
    firstName: 'factory',
    email: 'factory@email.com',
    password: 'password',
    RoleId: 2
  },

  updateDetails: {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    RoleId: 2
  }
};
