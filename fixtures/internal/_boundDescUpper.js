/**
 * Returns a description of an upper bound condition
 *
 * @function
 * @private
 * @since v0.0.1
 * @category Miscellaneous
 * @sig a -> Boolean -> String
 * @param {*} upperBound
 * @param {Boolean} inclusive - Whether values are allowed to equal `upperBound`
 * @returns {String}
 * @example
 *
 * _boundDescUpper(42, true)   //=> 'must be <= 42'
 *
 * _boundDescUpper(42, false)  //=> 'must be < 42'
 *
 */
const _boundDescUpper = (upperBound, inclusive) =>
  `must be ${(inclusive ? '<=' : '<')} ${upperBound}`

module.exports = _boundDescUpper
