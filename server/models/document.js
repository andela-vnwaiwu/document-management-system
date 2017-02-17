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
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    }
  }, {
    classMethods: {
      associate: function (models) {
        Document.belongsTo(models.User, {
          as: 'Owner',
          onDelete: 'CASCADE',
          foreignKey: 'OwnerId'
        });
      }
    }
  });
  return Document;
};
