'use strict';
module.exports = function (sequelize, DataTypes) {
  var Category = sequelize.define('Category', {
    title: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      associate: function (models) {
        Category.hasMany(models.Document, {
          foreignKey: 'CategoryId'
        });
      }
    }
  });
  return Category;
};