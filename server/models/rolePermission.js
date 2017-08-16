'use strict';
module.exports = function(sequelize, DataTypes) {
  var RolePermission = sequelize.define('RolePermission', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    roleId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        isNumeric: {
          args: true,
          msg: 'roleId must be a number and defined'
        }
      }
    },
    permissionId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        isNumeric: {
          args: true,
          msg: 'permissionId must be a number and defined'
        }
      }
    },
  }, {
    classMethods: {
      associate(models) {
        RolePermission.belongsTo(models.Role, {
          foreignKey: 'roleId'
        });

        RolePermission.belongsTo(models.Permission, {
          foreignKey: 'permissionId'
        });
      }
    },
    freezeTableName: true,
  });

  return RolePermission;
};