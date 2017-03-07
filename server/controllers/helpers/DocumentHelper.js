/**
 * Helper methods for Documents
 */
const DocumentHelper = {
  /**
   * @desc transform Document result from query
   * @param {Object} doc response object containing result
   * @returns {Object} transformed user attributes
   */
  transformDocument(doc) {
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
  },

  /**
   * @desc PaginateResult pagination information for database result
   * @param {Object} result object containing result from database
   * @param {Number} offset Number of result to skip
   * @param {Number} limit Number of result to return at a time
   * @returns {Object} the metadata of the result
   */
  paginateResult(result, offset, limit) {
    const paginatedResult = {};

    paginatedResult.currentPage = Math.floor(offset / limit) + 1;
    paginatedResult.pageCount = Math.ceil(result.count / limit);
    paginatedResult.pageSize = Number(limit);
    paginatedResult.totalCount = result.count;

    return paginatedResult;
  }
};

export default DocumentHelper;
