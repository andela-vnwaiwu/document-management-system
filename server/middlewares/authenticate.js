/* eslint import/no-unresolved: 0 */
import jwt from 'jsonwebtoken';
import db from '../models';

const secretKey = process.env.JWT_SECRET_KEY || 'jhebefuehf7yu3832978ry09iofe';

const Authenticate = {
  verifyToken(req, res, next) {
    const token = req.headers.authorization || req.headers['x-access-token'];

    if (!token) {
      return res.status(401).send({ message: 'Unauthorized Access' });
    }

    jwt.verify(token, secretKey, (err, result) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid Token' });
      }
      req.decoded = result;
      next();
    });
  },

  isAdmin(req, res, next) {
    const adminId = req.decoded.RoleId;
    db.Role.findById(adminId).then((role) => {
      if (role && role.title === 'admin') {
        next();
      } else {
        return res.status(403).send({ message: 'You are not an Admin' });
      }
    });
  },

  userPermission(req, res, next) {
    const userId = req.params.id;
    const ownerId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    db.User.findById(ownerId).then((user) => {
      if (user && user.id === userId) {
        next();
      } else {
        db.Role.findById(roleId).then((role) => {
          if (role && role.title === 'admin') {
            next();
          } else {
            return res.status(403).send({ message: 'You are not the owner' });
          }
        });
      }
    });
  },

  viewPermission(req, res, next) {
    const docId = req.params.id;
    const userId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    db.Role.findById(roleId).then((role) => {
      if (role && role.title === 'admin') {
        next();
      } else if (docId) {
        db.Document.findById(docId).then((doc) => {
          if (doc) {
            if (doc.isPublic || doc.OwnerId === userId) {
              next();
            } else {
              return res.status(403)
                .send({ message: 'You are not allowed to view this document' });
            }
          }
        });
      } else {
        next();
      }
    });
  },

  docPermission(req, res, next) {
    const docId = req.params.id;
    const userId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    db.Document.findById(docId).then((doc) => {
      if (doc && doc.OwnerId === userId) {
        next();
      } else {
        db.Role.findById(roleId).then((role) => {
          if (role && role.title === 'admin') {
            next();
          } else {
            return res.status(403)
              .send({ message: 'You are not allowed to access this document' });
          }
        });
      }
    });
  }
};

export default Authenticate;
