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

const documents = {
  create: (req, res) => {
    req.body.OwnerId = req.decoded.userId;
    db.Document.create(req.body).then((doc) => {
      const document = docAttributes(doc);
      return res.status(200).json(document);
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
  },

  getAll: (req, res) => {
    const userId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    db.Role.findById(roleId).then((role) => {
      if (role && role.title === 'admin') {
        db.Document.findAll({
          attributes: ['id', 'title', 'content', 'isPublic', 'tags', 'createdAt', 'updatedAt']
        }).then((result) => {
          if (!result) {
            return res.status(404).json({ message: 'No Document found' });
          }
          return res.status(200).json(result);
        });
      } else {
        db.Document.findAll({
          where: {
            $or: [{
              isPublic: true,
            }, {
              OwnerId: userId
            }]
          }
        }).then((results) => {
          if (!results) {
            return res.status(404).json({ message: 'No document found' });
          }
          return res.status(200).json(results);
        });
      }
    });
  },

  getOne: (req, res) => {
    const docId = req.params.id;
    db.Document.findById(docId).then((result) => {
      if (!result) {
        return res.status(404).json({ message: 'Document not found' });
      }
      const document = docAttributes(result);
      return res.status(200).json(document);
    });
  },

  update: (req, res) => {
    const docId = req.params.id;
    db.Document.findById(docId).then((result) => {
      if (!result) {
        return res.status(404).json({ message: 'Document not found' });
      }
      result.update(req.body).then((updatedResult) => {
        return res.status(200)
          .json({ message: 'Document updated successfully', updatedResult });
      });
    });
  },

  remove: (req, res) => {
    const docId = req.params.id;
    db.Document.destroy({
      where: {
        id: docId
      }
    }).then((doc) => {
      if (!doc) {
        return res.status(404)
          .json({ message: `Could not find document ${docId} to delete` });
      }
      return res.status(200).json({ message: 'Document deleted successfully' });
    });
  },

  getDocsForUser: (req, res) => {
    const queryId = req.params.id;
    const ownerId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    db.Role.findById(roleId).then((role) => {
      if (role) {
        if (ownerId === queryId || role.title === 'admin') {
          db.Document.find({
            where: {
              id: queryId
            }
          }).then((docs) => {
            if (!docs) {
              return res.status(404).json({ message: 'No documents found' });
            }
            const results = docs;
            return res.status(200).json(results);
          });
        } else {
          db.Document.find({
            where: {
              id: queryId,
              $and: {
                isPublic: true
              }
            }
          }).then((docs) => {
            if (!docs) {
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

export default documents;
