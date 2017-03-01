/* eslint import/no-unresolved: 0 */
import db from '../../models/';

const docAttributes = (doc) => {
  const attributes = {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    OwnerId: doc.OwnerId,
    isPublic: doc.isPublic,
    tags: doc.tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };

  return attributes;
};

const Documents = {
 /**
  * Create a new document
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  create(req, res) {
    req.body.OwnerId = req.decoded.userId;
    db.Document.create(req.body).then((doc) => {
      const document = docAttributes(doc);
      return res.status(200).json(document);
    })
    .catch((error) => {
      const result = [];
      error.errors.forEach((type) => {
        result.push(type.path);
      });

      let errorMessage = result.join(', ');
      errorMessage += ' cannot be empty';
      return res.status(400).json({ message: errorMessage });
    });
  },

  /**
  * Gets all Documents
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getAll(req, res) {
    const userId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    const query = {};
    query.limit = (req.query.limit > 0) ? req.query.limit : null;
    query.offset = (req.query.page - 1 > 0) ? req.query.page - 1 : null;
    query.order = [['createdAt', 'DESC']];

    db.Role.findById(roleId).then((role) => {
      if (role && role.title !== 'admin') {
        query.where = { $or: [{ isPublic: true }, { OwnerId: userId }] };
      }

      db.Document.findAndCountAll(query).then((result) => {
        if (result.count < 1) {
          return res.status(404).json({ message: 'No document found' });
        }

        return res.status(200)
          .json({ result: result.rows, count: result.count });
      });
    });
  },

  /**
  * Gets a Document
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  getOne(req, res) {
    const docId = req.params.id;

    db.Document.findById(docId).then((result) => {
      if (result < 1) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const document = docAttributes(result);
      return res.status(200).json(document);
    });
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
      if (result < 1) {
        return res.status(404).json({ message: 'Document not found' });
      }

      req.body.OwnerId = result.OwnerId;

      result.update(req.body).then(updatedResult => res.status(200)
        .json({ message: 'Document updated successfully', updatedResult }));
    });
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
    });
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
    const roleId = req.decoded.RoleId;
    const query = {};
    query.limit = (req.query.limit > 0) ? req.query.limit : null;
    query.offset = (req.query.page - 1 > 0) ? req.query.page - 1 : null;
    query.order = [['createdAt', 'DESC']];

    db.Role.findById(roleId).then((role) => {
      if (role) {
        if (role.title === 'admin' || ownerId === queryId) {
          query.where = { OwnerId: queryId };
        } else {
          query.where = { OwnerId: queryId, $and: { isPublic: true } };
        }
        db.Document.findAndCountAll(query).then((result) => {
          if (result.count < 1) {
            return res.status(404).json({ message: 'No documents found' });
          }

          return res.status(200)
            .json({ result: result.rows, count: result.count });
        });
      }
    });
  }
};

export default Documents;
