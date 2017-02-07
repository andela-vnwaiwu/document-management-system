'use strict';
module.exports = function (sequelize, DataTypes) {
  var Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false

    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    OwnerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    access: {
      defaultValue: 'public',
      type: DataTypes.STRING
    },
    CategoryId: {
      type: DataTypes.INTEGER
    }
  }, {
    underscored: true,
    classMethods: {
      associate: function (models) {
        Document.belongsTo(models.User, {
          as: 'Owner',
          onDelete: 'CASCADE',
          foreignKey: 'OwnerId'
        });
        Document.belongsTo(models.Category, {
          onDelete: 'CASCADE',
          foreignKey: 'CategoryId'
        });
      }
    }
  });
  return Document;
};