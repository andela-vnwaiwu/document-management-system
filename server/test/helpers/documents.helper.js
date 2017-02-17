/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import faker from 'faker';

const documents = {
  first: {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    access: 'public',
    tags: ['news', 'nature', 'photography']
  },

  second: {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    access: 'private',
    tags: ['fashion', 'clothes', 'women']
  },

  third: {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    access: 'private',
    tags: ['fashion', 'clothes', 'women']
  },

  badDoc: {
    title: faker.lorem.words(),
    access: 'public',
    tags: ['news', 'nature', 'photography']
  }
};

export default documents;
