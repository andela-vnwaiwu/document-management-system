/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint import/no-unresolved: 0 */
import faker from 'faker';

const documents = {
  first: {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    tags: ['news', 'nature', 'photography']
  },

  second: {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    tags: ['fashion', 'clothes', 'women']
  },

  third: {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    isPublic: false,
    tags: ['fashion', 'clothes', 'women']
  },

  badDoc: {
    title: faker.lorem.words(),
    tags: ['news', 'nature', 'photography']
  }
};

export default documents;
