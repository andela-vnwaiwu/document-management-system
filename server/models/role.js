'use strict';
module.exports = function (sequelize, DataTypes) {
  var Role = sequelize.define('Role', {
    title: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        }
      }
    }
  }, {
    classMethods: {
      associate: function (models) {
        Role.hasMany(models.User)
      }
    }
  });
  return Role;
};
