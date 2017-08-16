module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('Roles', [{
      title: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: 'manager',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: 'regular',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: 'guest',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};
