/* eslint import/no-unresolved: 0 */
import jwt from 'jsonwebtoken';
import db from '../../models/';
import ErrorHandler from '../helpers/ErrorHandler';
import UserHelper from '../helpers/UserHelper';
import DocumentHelper from '../helpers/DocumentHelper';

const secretKey = process.env.JWT_SECRET_KEY || 'jhebefuehf7yu3832978ry09iofe';

const Users = {
  /**
  * Creates a new user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  signup(req, res) {
    db.User.findAndCountAll({
      where: {
        $or: [{ email: req.body.email }, { RoleId: 1 }]
      }
    }).then((returnedUsers) => {
      const result = returnedUsers.rows;
      const checkEmail = UserHelper.searchUserResult(result, 'email', req.body.email);
      const checkRoleId = UserHelper
        .searchUserResult(result, 'RoleId', Number(req.body.RoleId));

      if (checkEmail) {
        return res.status(409)
          .json({ message: `User with ${req.body.email} already exists` });
      } else if (checkRoleId) {
        return res.status(409)
          .json({ message: 'You cannot create another admin' });
      }

      db.User.create(req.body).then((user) => {
        const jwtData = {
          username: user.username,
          email: user.email,
          RoleId: user.RoleId,
          userId: user.id
        };

        const token = jwt.sign(jwtData, secretKey, { expiresIn: 86400 });
        user = UserHelper.transformUser(user);
        return res.status(201).json({ token, expiresIn: 86400, user });
      })
      .catch(error => ErrorHandler.processError(res, 400, error));
    });
  },

  /**
  * Logs a user into the api
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  login(req, res) {
    db.User.findOne({ where: { email: req.body.email } }).then((user) => {
      if (user && user.matchPassword(req.body.password)) {
        const token = jwt.sign({
          userId: user.id,
          RoleId: user.RoleId
        }, secretKey, { expiresIn: 86400 });

        user = UserHelper.transformUser(user);
        return res.status(200).json({ token, expiresIn: 86400, user });
      }

      return res.status(401).json({ message: 'Failed to authenticate user' });
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Logs a user out of the api
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  logout(req, res) {
    const token = req.headers.authorization || req.headers['x-access-token'];

    if (!token) {
      return res.status(400).json({ message: 'User not logged in before' });
    }

    return res.status(200).json({ message: 'User successfully logged out' });
  },

  /**
  * Get all users
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  findAll(req, res) {
    const query = {};
    query.attributes = ['id', 'username', 'firstName', 'lastName', 'email',
      'RoleId', 'createdAt', 'updatedAt'];
    query.limit = (req.query.limit > 0) ? req.query.limit : 5;
    query.offset = (req.query.offset > 0) ? req.query.offset : 0;
    query.order = [['createdAt', 'DESC']];

    db.User.findAndCountAll(query).then((result) => {
      const offset = query.offset;
      const limit = query.limit;

      const pagination = DocumentHelper.paginateResult(result, offset, limit);
      return res.status(200)
        .json({ users: result.rows, pagination });
    });
  },

  /**
  * Get a user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  findOne(req, res) {
    const userId = req.params.id;
    db.User.findById(userId).then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'No user with Id found' });
      }

      user = UserHelper.transformUser(user);
      return res.status(200).json(user);
    });
  },

  /**
  * Update a user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  updateOne(req, res) {
    const userId = req.params.id;
    const roleId = req.decoded.RoleId;

    db.User.findById(userId).then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      db.Role.findById(roleId).then((role) => {
        if (role && role.title !== 'admin') {
          req.body.RoleId = user.RoleId;
        }

        user.update(req.body).then((result) => {
          const updatedUser = UserHelper.transformUser(result);
          return res.status(200)
            .json({ user: updatedUser, message: 'user updated successfully' });
        });
      });
    });
  },

  /**
  * Delete a user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  remove(req, res) {
    const userId = req.params.id;
    db.Role.findOne({ where: { title: 'admin' } })
      .then((role) => {
        if (role) {
          db.User.findAndCountAll({ where: { RoleId: role.id } })
            .then((users) => {
              const lastAdmin = users.rows[0].dataValues.id;
              if (users.count < 2 && lastAdmin === Number(userId)) {
                return res.status(403)
                  .json({ message: 'You cannot delete the Admin' });
              }
              db.User.destroy({ where: { id: userId } })
                .then((result) => {
                  if (!result) {
                    return res.status(404)
                      .json({ message: 'No user found to delete' });
                  }

                  return res.status(200)
                    .json({ message: 'User successfully deleted' });
                });
            });
        }
      });
  },

  /**
  * Create an admin user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  createAdmin(req, res) {
    db.Role.findOne({ where: { title: 'admin' } })
      .then((role) => {
        req.body.RoleId = role.id;

        db.User.findOne({ where: { email: req.body.email } })
          .then((user) => {
            if (user) {
              return res.status(409)
                .json({ message: `User with ${req.body.email} exists` });
            }

            db.User.create(req.body)
              .then((result) => {
                const jwtData = {
                  username: result.username,
                  email: result.email,
                  RoleId: result.RoleId,
                  userId: result.id
                };

                const token = jwt.sign(jwtData, secretKey, { expiresIn: 86400 });
                result = UserHelper.transformUser(result);
                return res.status(201)
                  .json({ token, expiresIn: 86400, result });
              })
              .catch(error => ErrorHandler.processError(res, 400, error));
          });
      });
  }
};

export default Users;
