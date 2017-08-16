/* eslint import/no-unresolved: 0 */
import jwt from 'jsonwebtoken';
import db from '../models';

const secretKey = process.env.JWT_SECRET_KEY || 'jhebefuehf7yu3832978ry09iofe';

const Authenticate = {
  /**
   * Verify role middleware
   *
   * @param {Object} req request object payload
   * @param {Object} res response object
   * @param {Function} next callback function
   *
   * @returns {any} response object or call back function
   */
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

  /**
   * Admin role middleware
   *
   * @param {Object} req request object payload
   * @param {Object} res response object
   * @param {Function} next callback function
   *
   *  @returns {any} response object or call back function
   */
  isAdmin(req, res, next) {
    const adminId = req.decoded.roleId;
    db.Role.findById(adminId).then((role) => {
      if (role && role.title === 'admin') {
        next();
      } else {
        return res.status(403).send({ message: 'You are not an Admin' });
      }
    });
  },

  /**
   * User's permission middleware for checking if a user is allowed to access the user routes
   *
   * @param {Object} req request object payload
   * @param {Object} res response object
   * @param {Function} next callback function
   *
   * @returns {any} response object or call back function
   */
  userPermission(req, res, next) {
    const userId = Number(req.params.id);
    const ownerId = req.decoded.userId;
    const roleId = req.decoded.roleId;
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

  /**
   * Delete Document middleware for checking if a user is allowed to delete a document
   *
   * @param {Object} req request object payload
   * @param {Object} res response object sent to the user
   * @param {function} next callback function invoked on success
   *
   * @returns {any} response object or call back function
   */
  deleteDocPermission(req, res, next) {
    const documentId = Number(req.params.id);
    const userId = req.decoded.userId;
    const roleId = req.decoded.roleId;

    db.Document.findById(documentId).then((document) => {
      if (document) {
        if (document.dataValues.ownerId === userId) {
          next();
        } else {
          db.Role.findOne({ where: { id: roleId }, include: [{ model: db.Permission }] })
            .then((role) => {
              if (role) {
                const permissions = role.dataValues.Permissions.map((permission) => {
                  return permission.dataValues.id;
                });
                db.Permission.findOne({ where: { name: 'delete' } })
                  .then((result) => {
                    if (result && permissions.includes(result.dataValues.id)) {
                      next();
                    } else {
                      return res.status(403).json({
                        status: 'forbidden',
                        message: 'You are not allowed to delete this document'
                      });
                    }
                  });
              }
            });
        }
      } else {
        return res.status(404).json({
          status: 'not found',
          message: 'Document not found to delete'
        });
      }
    })
    .catch(error => res.status(500).json({
      status: 'error',
      message: 'An error occurred while searching for document permission',
      error
    }));
  },

  /**
   * Edit Document middleware for checking if a user is allowed to edit a document
   *
   * @param {Object} req request object payload
   * @param {Object} res response object sent to the user
   * @param {function} next callback function invoked on success
   *
   * @returns {any} response object or call back function
   */
  editDocPermission(req, res, next) {
    const documentId = Number(req.params.id);
    const userId = req.decoded.userId;
    const roleId = req.decoded.roleId;

    return db.Document.findById(documentId).then((document) => {
      if (document) {
        if (document.dataValues.ownerId === userId) {
          next();
        } else if (document.access === 'role') {
          return db.Role.findOne({ where: { id: roleId }, include: [{ model: db.Permission }] })
            .then((role) => {
              if (role) {
                const permissions = role.dataValues.Permissions.map((permission) => {
                  return permission.dataValues.id;
                });
                return db.Permission.findOne({ where: { name: 'edit' } })
                  .then((result) => {
                    if (result && permissions.includes(result.dataValues.id)) {
                      next();
                    } else {
                      return res.status(403).json({
                        status: 'forbidden',
                        message: 'You are not allowed to edit this document'
                      });
                    }
                  });
              }
            });
        } else {
          return res.status(403).json({
            status: 'forbidden',
            message: 'You are not allowed to edit this document as you are not the owner'
          });
        }
      } else {
        return res.status(404).json({
          status: 'not found',
          message: 'Could not find selected document'
        });
      }
    })
    .catch(error => res.status(500).json({
      message: 'An error occurred while checking document permission',
      error
    }));
  },

  /**
   * View Document middleware for checking if a user is allowed to view a document
   *
   * @param {Object} req request object payload
   * @param {Object} res response object sent to the user
   * @param {function} next callback function invoked on success
   *
   * @returns {any} response object or call back function
   */
  viewDocPermission(req, res, next) {
    const documentId = Number(req.params.id);
    const userId = req.decoded.userId;
    const roleId = req.decoded.roleId;

    db.Document.findById(documentId).then((document) => {
      if (document) {
        if (document.dataValues.ownerId === userId) {
          next();
        } else if (document.access === 'private') {
          db.Role.findOne({ where: { id: roleId }, include: [{ model: db.Permission }] })
            .then((role) => {
              if (role) {
                const permissions = role.dataValues.Permissions.map((permission) => {
                  return permission.dataValues.id;
                });

                db.Permission.findOne({ where: { name: 'view private' } })
                  .then((result) => {
                    if (result && permissions.includes(result.dataValues.id)) {
                      next();
                    } else {
                      return res.status(403).json({
                        status: 'forbidden',
                        message: 'You are not allowed to view this document'
                      });
                    }
                  });
              }
            });
        } else if (document.access === 'role') {
          db.User.findById(document.ownerId).then((user) => {
            if (user && user.roleId === roleId) {
              next();
            } else {
              return res.status(403).json({
                status: 'forbidden',
                message: 'You are not allowed to view this document'
              });
            }
          });
        } else {
          next();
        }
      } else {
        return res.status(404).json({
          status: 'not found',
          message: 'Document does not exist'
        });
      }
    })
    .catch(error => res.status(500).json({
      message: 'An error occurred while checking document permission',
      error
    }));
  },
};

export default Authenticate;
