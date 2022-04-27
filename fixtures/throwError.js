/**
 * Throws an exception. Used to allow terser code, e.g. replacing `if`/`else` with a ternary expression.
 *
 * @function
 * @since v0.0.1
 * @category Miscellaneous
 * @sig String -> THROW
 * @param {String} message - Error message for exception
 * @example
 *
 * throwError('clear and helpful error message') //=> EXCEPTION: "clear and helpful error message"
 *
 */
const throwError = message => {
  throw Error(message)
}

module.exports = throwError
