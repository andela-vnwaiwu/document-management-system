const bcrypt = require('bcrypt-nodejs');

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'LastName cannot be empty'
        }
      }
    },
    firstName: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'LastName cannot be empty'
        }
      }
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'LastName cannot be empty'
        }
      }
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail:{
          msg: 'Invalid email address provided'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [4, 100],
          msg: 'Your password is too short'
        }
      }
    },
    RoleId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: 'RoleId must be an integer'
        }
      }
    }
  }, {
    classMethods: {
      associate: function (models) {
        User.belongsTo(models.Role, {
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false
          }
        });

        User.hasMany(models.Document, {
          foreignKey: 'OwnerId'
        });
      }
    },

    instanceMethods: {

      /**
       * compare the input password with the hashed password stored
       * @param {String} password
       * @returns {Boolean} true or false
       */
      matchPassword(password) {
        return bcrypt.compareSync(password, this.password);
      },

      /**
       * hashes the password before storing
       * @param {String} password
       * @returns {void} no return
       */
      hashPassword() {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      }
    },

    hooks: {
      beforeCreate(user) {
        user.hashPassword()
      },

      beforeUpdate(user) {
        if (user._changed.password) {
          user.hashPassword();
        }
      }
    }
  });
  return User;
};
