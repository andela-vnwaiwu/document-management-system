/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint import/no-unresolved: 0 */
import faker from 'faker';

const factory = {
  users: {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    RoleId: 1
  },

  roles: {
    title: ['admin', 'owner', 'regular', 'guest']
  },

  secondUser: {
    username: 'faker',
    lastName: 'factory',
    firstName: 'factories',
    email: 'factory@email.com',
    password: 'password',
    RoleId: 2
  },

  thirdUser: {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    RoleId: 2
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
export default factory;
