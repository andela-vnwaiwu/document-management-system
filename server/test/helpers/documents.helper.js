/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/no-unresolved: 0 */
import faker from 'faker';

module.exports = {
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
  },

  searchPublicDoc: {
    title: 'cooking',
    content: `cooking or cookery is the art, technology and craft of preparing 
      food for consumption with the use of heat. Cooking techniques and ingredients 
      vary widely across the world, from grilling food over an open fire to using 
      electric stoves, to baking in various types of ovens, reflecting     
      unique environmental, economic, and cultural traditions and trends.`,
    tags: ['household', 'chef', 'cooking', 'andela']
  },

  searchPrivateDoc: {
    title: 'Software',
    content: `Computer software includes computer programs, libraries and 
      related non-executable data, such as online documentation or digital media.
      Computer hardware and software require each other and neither can be 
      realistically used on its own.`,
    isPublic: false,
    tags: ['programming', 'code', 'software', 'andela']
  }
};
