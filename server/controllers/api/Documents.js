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
      return res.status(400).json(error);
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
    db.Role.findById(roleId).then((role) => {
      if (role && role.title === 'admin') {
        db.Document.findAll({
          attributes: ['id', 'title', 'content', 'isPublic', 'tags', 'createdAt', 'updatedAt'],
          order: [['createdAt', 'DESC']]
        }).then((result) => {
          if (result < 1) {
            return res.status(404).json({ message: 'No Document found' });
          }
          return res.status(200).json({ result, message: userId });
        });
      } else {
        db.Document.findAll({
          where: {
            $or: [{
              isPublic: true,
            }, {
              OwnerId: userId
            }]
          },
          order: [['createdAt', 'DESC']]
        }).then((results) => {
          if (results < 1) {
            return res.status(404).json({ message: 'No document found' });
          }
          return res.status(200).json(results);
        });
      }
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
      result.update(req.body).then((updatedResult) => {
        return res.status(200)
          .json({ message: 'Document updated successfully', updatedResult });
      });
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
    const queryId = req.params.id;
    const ownerId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    db.Role.findById(roleId).then((role) => {
      if (role) {
        if (ownerId === queryId || role.title === 'admin') {
          db.Document.findAll({
            where: {
              OwnerId: queryId
            },
            order: [['createdAt', 'DESC']]
          }).then((docs) => {
            if (docs < 1) {
              return res.status(404).json({ message: 'No documents found' });
            }
            const results = docs;
            return res.status(200).json(results);
          });
        } else {
          db.Document.findAll({
            where: {
              OwnerId: queryId,
              $and: {
                isPublic: true
              }
            },
            order: [['createdAt', 'DESC']]
          }).then((docs) => {
            if (docs < 1) {
              return res.status(404).json({ message: 'No documents found' });
            }
            const results = docs;
            return res.status(200).json(results);
          });
        }
      }
    });
  }
};

export default Documents;
