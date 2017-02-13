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
  }
};
export default factory;
