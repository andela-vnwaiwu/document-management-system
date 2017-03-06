/* eslint import/no-unresolved: 0 */
import db from '../../models/';
import ErrorHandler from '../helpers/ErrorHandler';
import DocumentHelper from '../helpers/DocumentHelper';

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
    const searchTerm = req.query.text;
    const query = {};
    query.limit = (req.query.limit > 0) ? req.query.limit : null;
    query.offset = (req.query.offset > 0) ? req.query.offset : null;
    query.order = [['createdAt', 'DESC']];

    db.Role.findById(roleId).then((role) => {
      if (role && role.title === 'admin') {
        query.where = { $or: [
          { title: { $iLike: `%${searchTerm}%` } },
          { content: { $iLike: `%${searchTerm}%` } }
        ] };
      } else {
        query.where = { $or: [
          { title: { $iLike: `%${searchTerm}%` } },
          { content: { $iLike: `%${searchTerm}%` } }],
          $and: { $or: [{ isPublic: true }, { OwnerId: userId }]
          } };
      }

      db.Document.findAndCountAll(query).then((result) => {
        if (result.count < 1) {
          return res.status(404).json({ message: 'No matching result' });
        }

        const offset = query.offset;
        const limit = query.limit;

        const pagination = DocumentHelper.paginateResult(result, offset, limit);
        return res.status(200)
          .json({
            result: result.rows,
            count: result.count,
            pagination
          });
      })
      .catch(error => ErrorHandler.processError(res, 500, error));
    })
    .catch(error => ErrorHandler.processError(res, 500, error));
  }
};

export default Search;
