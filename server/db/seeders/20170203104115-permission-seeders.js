module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('Permissions', [{
      id: 1,
      name: 'delete',
      description: 'Has the ability to delete items',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      name: 'edit',
      description: 'Has the ability to edit items',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 3,
      name: 'view',
      description: 'Has the ability to view items',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 4,
      name: 'view private',
      description: 'Has the ability to view private items',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('Permissions', {
      id: [1, 2, 3, 4]
    });
  }
};
