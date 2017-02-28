/* eslint import/no-unresolved: 0 */
import jwt from 'jsonwebtoken';
import db from '../../models/';

const secretKey = process.env.JWT_SECRET_KEY || 'jhebefuehf7yu3832978ry09iofe';

const userAttributes = (user) => {
  const attributes = {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    RoleId: user.RoleId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return attributes;
};


const Users = {
  /**
  * Creates a new user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  create(req, res) {
    db.User.findOne({
      where: {
        email: req.body.email
      }
    }).then((returnedUser) => {
      if (returnedUser) {
        return res.status(409).json({
          message: `User with ${req.body.email} already exists`
        });
      }
      db.User.create({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        RoleId: req.body.RoleId
      }).then((user) => {
        const jwtData = {
          username: user.username,
          email: user.email,
          RoleId: user.RoleId,
          userId: user.id
        };
        const token = jwt.sign(jwtData, secretKey, { expiresIn: 86400 });
        user = userAttributes(user);
        return res.status(201).json({ token, expiresIn: 86400, user });
      })
      .catch((error) => {
        return res.status(400).json(error.errors);
      });
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
        user = userAttributes(user);
        return res.status(302).json({ token, expiresIn: 86400, user });
      }
      return res.status(401).json({ message: 'Failed to authenticate user' });
    });
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
    return res.status(302).json({ message: 'User successfully logged out' });
  },

  /**
  * Get all users
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  findAll(req, res) {
    db.User.findAll({
      attributes: [
        'id',
        'username',
        'firstName',
        'lastName',
        'email',
        'RoleId',
        'createdAt',
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    }).then((result) => {
      return res.status(200).json({ users: result });
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
      user = userAttributes(user);
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
    db.User.findById(userId).then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.update(req.body).then((result) => {
        const updatedUser = userAttributes(result);
        return res.status(200).json({ user: updatedUser });
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
    db.Role.findOne({
      where: {
        title: 'admin'
      }
    }).then((role) => {
      db.User.findById(userId).then((user) => {
        if (user && user.RoleId === role.id) {
          return res.status(403)
            .json({ message: 'You cannot delete the admin' });
        }
        db.User.destroy({
          where: {
            id: userId
          }
        }).then((result) => {
          if (!result) {
            return res.status(404).json({ message: 'No user found to delete' });
          }
          return res.status(200).json({ message: 'User successfully deleted' });
        });
      });
    });
  }
};

export default Users;
