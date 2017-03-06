/**
 * Helper methods for Users
 */
const UserHelper = {
  /**
   * @desc transform Users result from query
   * @param {Object} user response object containing response
   * @returns {Object} transformed user attributes
   */
  transformUser(user) {
    const attributes = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      RoleId: user.RoleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return attributes;
  },

  /**
   * @desc SearchUSerResult search users result from query
   * @param {Object} result object containing result from database
   * @param {String} key string  property from result
   * @param {String} value string value to search for in result
   * @returns {Boolean} true if value is found else returns false
   */
  searchUserResult(result, key, value) {
    return result.some((hasEmail) => {
      const obj = hasEmail.dataValues;
      return Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === value;
    });
  }
};

export default UserHelper;
