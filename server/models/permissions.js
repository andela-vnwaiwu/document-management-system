export default (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Permission.belongsToMany(models.Role, {
          foreignKey: 'permissionId',
          through: 'RolePermission',
        });
      }
    }
  });

  return Permission;
};