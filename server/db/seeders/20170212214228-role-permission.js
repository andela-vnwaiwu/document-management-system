module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('RolePermission', [{
      roleId: 1,
      permissionId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 1,
      permissionId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 1,
      permissionId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 1,
      permissionId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 2,
      permissionId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 2,
      permissionId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 2,
      permissionId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 3,
      permissionId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 3,
      permissionId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      roleId: 4,
      permissionId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('RolePermission', {
      id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });
  }
};
