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
      CategoryId: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Documents');
  }
};
