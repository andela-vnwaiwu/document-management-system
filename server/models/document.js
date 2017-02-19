module.exports = function (sequelize, DataTypes) {
  var Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title field cannot be empty'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title field cannot be empty'
        }
      }
    },
    OwnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'OwnerId must be an integer'
        }
      }
    },
    isPublic: {
      defaultValue: true,
      type: DataTypes.BOOLEAN
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
