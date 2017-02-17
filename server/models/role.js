'use strict';
module.exports = function (sequelize, DataTypes) {
  var Role = sequelize.define('Role', {
    title: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function (models) {
        Role.hasMany(models.User, {
          foreignKey: 'RoleId'
        })
      }
    }
  });
  return Role;
};
