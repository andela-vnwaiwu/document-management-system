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

  managerRole: {
    title: 'manager'
  },

  regularRole: {
    title: 'regular'
  },

  guestRole: {
    title: 'guest'
  },

  testRole: {
    title: 'testRole'
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
    roleId: 2
  },

  updateDetails: {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    roleId: 2
  },

  viewPermission: {
    id: 3,
    name: 'view',
    description: 'has read access',
  },

  editPermission: {
    id: 2,
    name: 'edit',
    description: 'has write access',
  },

  deletePermission: {
    id: 1,
    name: 'delete',
    description: 'has delete access',
  },

  viewPrivatePermission: {
    id: 4,
    name: 'view private',
    description: 'can view private documents',
  },
};
