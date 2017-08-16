export default (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
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
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'OwnerId must be an integer'
        }
      }
    },
    access: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [
        'public',
        'private',
        'role'
      ],
      validate: {
        isIn: [[
          'public',
          'private',
          'role'
        ]]
      },
      defaultValue: 'public'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    }
  }, {
    classMethods: {
      associate: function(models) {
        Document.belongsTo(models.User, {
          onDelete: 'CASCADE',
          foreignKey: 'ownerId'
        });
      }
    }
  });

  return Document;
};