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

  searchUserResult(result, key, value) {
    return result.some((hasEmail) => {
      const obj = hasEmail.dataValues;
      return Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === value;
    });
  }
};

export default UserHelper;
