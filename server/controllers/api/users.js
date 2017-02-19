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


const users = {
  create: (req, res) => {
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
        const token = jwt.sign(jwtData, secretKey, { expiresIn: 3600 });
        user = userAttributes(user);
        return res.status(201).json({ token, expiresIn: 3600, user });
      })
      .catch(error => res.status(400).json(error.errors));
    });
  },

  login: (req, res) => {
    db.User.findOne({ where: { email: req.body.email } }).then((user) => {
      if (user && user.matchPassword(req.body.password)) {
        const token = jwt.sign({
          userId: user.id,
          RoleId: user.RoleId
        }, secretKey, { expiresIn: 3600 });
        user = userAttributes(user);
        return res.status(302).json({ token, expiresIn: 86400, user });
      }
      return res.status(401).json({ message: 'Failed to authenticate user' });
    });
  },

  logout: (req, res) => {
    const token = req.headers.authorization || req.headers['x-access-token'];
    if (!token) {
      return res.status(400).json({ message: 'User not logged in before' });
    }
    return res.status(302).json({ message: 'User successfully logged out' });
  },

  findAll: (req, res) => {
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
      ]
    }).then((result) => {
      return res.status(200).json({ users: result });
    });
  },

  findOne: (req, res) => {
    const userId = req.params.id;
    db.User.findById(userId).then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'No user with Id found' });
      }
      user = userAttributes(user);
      return res.status(200).json(user);
    });
  },

  updateOne: (req, res) => {
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

  remove: (req, res) => {
    const userId = req.params.id;
    db.User.destroy({
      where: {
        id: userId
      }
    }).then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'No user found to delete' });
      }
      return res.status(200).json({ message: 'User successfully deleted' });
    });
  }
};

export default users;
