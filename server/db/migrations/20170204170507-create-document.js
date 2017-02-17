'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false

      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      OwnerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      access: {
        defaultValue: 'public',
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Documents');
  }
};
