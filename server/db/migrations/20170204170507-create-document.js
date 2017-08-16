module.exports = {
  up(queryInterface, Sequelize) {
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
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      access: {
        type: Sequelize.ENUM,
        values: [
          'public',
          'private',
          'role'
        ],
        defaultValue: 'public',
        allowNull: false
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
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Documents');
  }
};
