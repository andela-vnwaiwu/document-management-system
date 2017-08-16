/* eslint import/no-unresolved: 0 */
import db from '../../models/';
import ErrorHandler from '../helpers/ErrorHandler';
import DocumentHelper from '../helpers/DocumentHelper';

const Documents = {
 /**
  * Create a new document
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  create(req, res) {
    req.body.ownerId = req.decoded.userId;
    db.Document.create(req.body).then((doc) => {
      const document = DocumentHelper.transformDocument(doc);
      return res.status(201).json(document);
    })
    .catch(error => ErrorHandler.processError(res, 400, error));
  },

  /**
  * Gets all Documents
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getAll(req, res) {
    const userId = req.decoded.userId;
    const roleId = req.decoded.roleId;
    const query = {};
    query.limit = (req.query.limit > 0) ? req.query.limit : 5;
    query.offset = (req.query.offset > 0) ? req.query.offset : 0;
    query.order = [['createdAt', 'DESC']];

    return db.Role.findById(roleId).then((role) => {
      if (role) {
        if (role.title !== 'admin') {
          query.where = { $or: [{ access: 'public' }, { ownerId: userId }] };
        }

        return db.Document.findAndCountAll(query).then((result) => {
          if (result.count < 1) {
            return res.status(404).json({ message: 'No document found' });
          }
          const offset = query.offset;
          const limit = query.limit;

          const pagination = DocumentHelper.paginateResult(result, offset, limit);
          return res.status(200)
            .json({ result: result.rows, pagination });
        });
      }
    })
    .catch(error => res.status(500).json({
      status: 'error',
      message: 'An error occured while trying to fetch all document',
      error,
    }));
  },

  /**
  * Gets a Document
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getOne(req, res) {
    const docId = req.params.id;

    return db.Document.findById(docId).then((result) => {
      const document = DocumentHelper.transformDocument(result);
      return res.status(200).json(document);
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Updates a document
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  update(req, res) {
    const docId = req.params.id;

    db.Document.findById(docId).then((result) => {
      req.body.ownerId = result.ownerId;

      result.update(req.body).then(updatedResult => res.status(200)
        .json({ message: 'Document updated successfully', updatedResult }));
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Deletes a document
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  remove(req, res) {
    const docId = req.params.id;

    db.Document.destroy({
      where: {
        id: docId
      }
    }).then((doc) => {
      if (doc < 1) {
        return res.status(404)
          .json({ message: `Could not find document ${docId} to delete` });
      }

      return res.status(200).json({ message: 'Document deleted successfully' });
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  },

  /**
  * Gets all Documents for a user
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getDocumentsForUser(req, res) {
    const queryId = Number(req.params.id);
    const ownerId = req.decoded.userId;
    const roleId = req.decoded.roleId;
    const query = {};
    query.limit = (req.query.limit > 0) ? req.query.limit : 5;
    query.offset = (req.query.offset > 0) ? req.query.offset : 0;
    query.order = [['createdAt', 'DESC']];

    return db.Role.findById(roleId).then((role) => {
      if (role) {
        if (role.title === 'admin' || ownerId === queryId) {
          query.where = { ownerId: queryId };
        } else {
          query.where = { ownerId: queryId, $and: { access: 'public' } };
        }
        return db.Document.findAndCountAll(query).then((result) => {
          if (result.count < 1) {
            return res.status(404).json({ message: 'No documents found' });
          }

          const offset = query.offset;
          const limit = query.limit;

          const pagination = DocumentHelper.paginateResult(result, offset, limit);

          return res.status(200)
            .json({ result: result.rows, pagination });
        });
      }
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  }
};

export default Documents;
