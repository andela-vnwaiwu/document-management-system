/**
 * Error handler for controllers
 */
const ErrorHandler = {
  /**
   * @desc process errors
   * @param {Object} res response object containing response
   * @param {Number} code status code of the response
   * @param {Object} error an object containing the errors and their message
   * @returns {Object} response object returned
   */
  processError(res, code, error) {
    let errorMessage;
    if (code === 400) {
      const result = [];
      error.errors.forEach((type) => {
        result.push(type.message);
      });

      errorMessage = result.join(', ');
      // errorMessage += ' cannot be empty';
    } else if (code === 500) {
      errorMessage = 'An internal server error occurred';
    } else {
      errorMessage = 'Header not correctly set';
    }
    return res.status(code).json({ message: errorMessage });
  }
};

export default ErrorHandler;
