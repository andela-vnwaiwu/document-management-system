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
        const token = jwt.sign({
          UserId: user.id,
          RoleId: user.RoleId
        }, secretKey, { expiresIn: 3600 });
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
    return res.status(200).json({ message: 'User successfully logged out' });
  }
};

export default users;
