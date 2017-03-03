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
  }
};

export default DocumentHelper;
