/* eslint import/no-unresolved: 0 */
import db from '../../models/';

const Search = {
  /**
  * Search all Documents
  * @param {Object} req Request object
  * @param {Object} res Response object
  * @returns {Object} - Returns response object
  */
  searchAll(req, res) {
    const userId = req.decoded.userId;
    const roleId = req.decoded.RoleId;
    const query = req.query.text;
    db.Role.findById(roleId).then((role) => {
      if (role && role.title === 'admin') {
        db.Document.findAll({
          where: {
            $or: [
              {
                title: { $iLike: `%${query}%` }
              },
              {
                content: { $iLike: `%${query}%` }
              }
            ]
          },
          order: [['createdAt', 'DESC']]
        }).then((results) => {
          if (results < 1) {
            return res.status(404).json({ results, message: 'No matching result' });
          }
          return res.status(200).json(results);
        });
      } else {
        db.Document.findAll({
          where: {
            $or: [
              { title: { $iLike: `%${query}%` } },
              { content: { $iLike: `%${query}%` } }
            ],
            $and: {
              $or: [
                { isPublic: true },
                { OwnerId: userId }
              ]
            }
          },
          order: [['createdAt', 'DESC']]
        }).then((results) => {
          if (results < 1) {
            return res.status(404).json({ results, message: 'No matching result' });
          }
          return res.status(200).json(results);
        });
      }
    });
  }
};

export default Search;
